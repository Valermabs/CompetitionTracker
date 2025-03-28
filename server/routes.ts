import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { MEDALS, POINTS, MedalType } from "@shared/schema";
import { setupAuth } from "./auth";

// Define validation schema for update request
const updateResultSchema = z.object({
  teamId: z.number(),
  eventId: z.number(),
  medal: z.enum([MEDALS.GOLD, MEDALS.SILVER, MEDALS.BRONZE, MEDALS.NON_WINNER, MEDALS.NO_ENTRY])
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  // Get all teams
  app.get("/api/teams", async (req: Request, res: Response) => {
    const teams = await storage.getTeams();
    return res.json(teams);
  });

  // Get all categories with events
  app.get("/api/categories", async (req: Request, res: Response) => {
    const categoriesWithEvents = await storage.getCategoryWithEvents();
    return res.json(categoriesWithEvents);
  });

  // Get team standings
  app.get("/api/standings", async (req: Request, res: Response) => {
    const standings = await storage.getTeamStandings();
    return res.json(standings);
  });

  // Get results for a specific event
  app.get("/api/events/:eventId/results", async (req: Request, res: Response) => {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const eventResults = await storage.getEventResults(eventId);
    if (!eventResults) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.json(eventResults);
  });

  // Update result for a team in an event - requires authentication
  app.post("/api/results/update", (req: Request, res: Response, next) => {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized - Please log in as admin" });
    }
    next();
  }, async (req: Request, res: Response) => {
    try {
      const { teamId, eventId, medal } = updateResultSchema.parse(req.body);
      
      // Check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if team exists
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // For validation, check existing medals in this event
      const eventResults = await storage.getResultsByEvent(eventId);
      
      // We've removed the unique medal validation to allow each team to win multiple medals
      // This is because each team can have 3 representatives in an event
      
      // Create a new result (allowing multiple medals per team per event)
      const points = POINTS[medal as MedalType];
      
      // Create a new result entry
      const newResult = await storage.createResult({
        teamId,
        eventId,
        medal: medal as MedalType,
        points
      });
      
      // Get updated standings to reflect changes
      const updatedStandings = await storage.getTeamStandings();
      const updatedEventResults = await storage.getEventResults(eventId);
      
      return res.json({ 
        message: "Result created successfully", 
        result: newResult,
        standings: updatedStandings,
        eventResults: updatedEventResults
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all events
  app.get("/api/events", async (req: Request, res: Response) => {
    const events = await storage.getEvents();
    return res.json(events);
  });
  
  // Update team icon - requires authentication
  app.post("/api/teams/:teamId/icon", (req: Request, res: Response, next) => {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized - Please log in as admin" });
    }
    next();
  }, async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.teamId);
      if (isNaN(teamId)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }
      
      const { icon } = req.body;
      if (!icon || typeof icon !== 'string') {
        return res.status(400).json({ message: "Icon data is required and must be a string" });
      }
      
      // Get the team
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Update the team with the new icon
      const updatedTeam = await storage.updateTeamIcon(teamId, icon);
      
      return res.json({ 
        message: "Team icon updated successfully", 
        team: updatedTeam
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
