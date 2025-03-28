import { 
  Team, InsertTeam, teams,
  Category, InsertCategory, categories,
  Event, InsertEvent, events,
  Result, InsertResult, results,
  User, InsertUser, users,
  TeamStanding, EventResult,
  MEDALS, POINTS, MedalType
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Team methods
  getTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  getTeamByName(name: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Event methods
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  getEventsByCategory(categoryId: number): Promise<Event[]>;
  
  // Result methods
  getResults(): Promise<Result[]>;
  getResult(id: number): Promise<Result | undefined>;
  getResultByTeamAndEvent(teamId: number, eventId: number): Promise<Result | undefined>;
  getResultsByEvent(eventId: number): Promise<Result[]>;
  getResultsByTeam(teamId: number): Promise<Result[]>;
  createResult(result: InsertResult): Promise<Result>;
  updateResult(id: number, medal: MedalType, points: number): Promise<Result | undefined>;
  
  // Computed data methods
  getTeamStandings(): Promise<TeamStanding[]>;
  getEventResults(eventId: number): Promise<EventResult | undefined>;
  getCategoryWithEvents(): Promise<{category: Category, events: Event[]}[]>;
  
  // Initialize data
  initializeData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private _teams: Map<number, Team>;
  private _categories: Map<number, Category>;
  private _events: Map<number, Event>;
  private _results: Map<number, Result>;
  private _users: Map<number, User>;
  
  private _teamIdCounter: number;
  private _categoryIdCounter: number;
  private _eventIdCounter: number;
  private _resultIdCounter: number;
  private _userIdCounter: number;
  
  constructor() {
    this._teams = new Map();
    this._categories = new Map();
    this._events = new Map();
    this._results = new Map();
    this._users = new Map();
    
    this._teamIdCounter = 1;
    this._categoryIdCounter = 1;
    this._eventIdCounter = 1;
    this._resultIdCounter = 1;
    this._userIdCounter = 1;
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this._users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this._users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this._userIdCounter++;
    const user: User = { ...insertUser, id };
    this._users.set(id, user);
    return user;
  }
  
  // Team methods
  async getTeams(): Promise<Team[]> {
    return Array.from(this._teams.values());
  }
  
  async getTeam(id: number): Promise<Team | undefined> {
    return this._teams.get(id);
  }
  
  async getTeamByName(name: string): Promise<Team | undefined> {
    return Array.from(this._teams.values()).find(team => team.name === name);
  }
  
  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this._teamIdCounter++;
    const team: Team = { ...insertTeam, id };
    this._teams.set(id, team);
    return team;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this._categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this._categories.get(id);
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this._categoryIdCounter++;
    const category: Category = { ...insertCategory, id };
    this._categories.set(id, category);
    return category;
  }
  
  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this._events.values());
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this._events.get(id);
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this._eventIdCounter++;
    const event: Event = { ...insertEvent, id };
    this._events.set(id, event);
    return event;
  }
  
  async getEventsByCategory(categoryId: number): Promise<Event[]> {
    return Array.from(this._events.values()).filter(event => event.categoryId === categoryId);
  }
  
  // Result methods
  async getResults(): Promise<Result[]> {
    return Array.from(this._results.values());
  }
  
  async getResult(id: number): Promise<Result | undefined> {
    return this._results.get(id);
  }
  
  async getResultByTeamAndEvent(teamId: number, eventId: number): Promise<Result | undefined> {
    return Array.from(this._results.values()).find(
      (result) => result.teamId === teamId && result.eventId === eventId,
    );
  }
  
  async getResultsByEvent(eventId: number): Promise<Result[]> {
    return Array.from(this._results.values()).filter(result => result.eventId === eventId);
  }
  
  async getResultsByTeam(teamId: number): Promise<Result[]> {
    return Array.from(this._results.values()).filter(result => result.teamId === teamId);
  }
  
  async createResult(insertResult: InsertResult): Promise<Result> {
    const id = this._resultIdCounter++;
    const result: Result = { ...insertResult, id };
    this._results.set(id, result);
    return result;
  }
  
  async updateResult(id: number, medal: MedalType, points: number): Promise<Result | undefined> {
    const result = this._results.get(id);
    if (!result) return undefined;
    
    const updatedResult: Result = { ...result, medal, points };
    this._results.set(id, updatedResult);
    return updatedResult;
  }
  
  // Computed data methods
  async getTeamStandings(): Promise<TeamStanding[]> {
    const teams = await this.getTeams();
    const standings: TeamStanding[] = [];
    
    for (const team of teams) {
      const results = await this.getResultsByTeam(team.id);
      
      const totalPoints = results.reduce((sum, result) => sum + result.points, 0);
      const goldCount = results.filter(result => result.medal === MEDALS.GOLD).length;
      const silverCount = results.filter(result => result.medal === MEDALS.SILVER).length;
      const bronzeCount = results.filter(result => result.medal === MEDALS.BRONZE).length;
      
      standings.push({
        teamId: team.id,
        teamName: team.name,
        teamColor: team.color,
        totalPoints,
        goldCount,
        silverCount,
        bronzeCount
      });
    }
    
    // Sort standings by total points (descending)
    return standings.sort((a, b) => b.totalPoints - a.totalPoints);
  }
  
  async getEventResults(eventId: number): Promise<EventResult | undefined> {
    const event = await this.getEvent(eventId);
    if (!event) return undefined;
    
    const results = await this.getResultsByEvent(eventId);
    const teams = await this.getTeams();
    
    const gold = results.find(r => r.medal === MEDALS.GOLD);
    const silver = results.find(r => r.medal === MEDALS.SILVER);
    const bronze = results.find(r => r.medal === MEDALS.BRONZE);
    
    const goldTeam = gold ? teams.find(t => t.id === gold.teamId) : undefined;
    const silverTeam = silver ? teams.find(t => t.id === silver.teamId) : undefined;
    const bronzeTeam = bronze ? teams.find(t => t.id === bronze.teamId) : undefined;
    
    return {
      eventId: event.id,
      eventName: event.name,
      gold: goldTeam ? { teamId: goldTeam.id, teamName: goldTeam.name, teamColor: goldTeam.color } : undefined,
      silver: silverTeam ? { teamId: silverTeam.id, teamName: silverTeam.name, teamColor: silverTeam.color } : undefined,
      bronze: bronzeTeam ? { teamId: bronzeTeam.id, teamName: bronzeTeam.name, teamColor: bronzeTeam.color } : undefined,
      results
    };
  }
  
  async getCategoryWithEvents(): Promise<{category: Category, events: Event[]}[]> {
    const categories = await this.getCategories();
    const result = [];
    
    for (const category of categories) {
      const categoryEvents = await this.getEventsByCategory(category.id);
      result.push({
        category,
        events: categoryEvents
      });
    }
    
    return result;
  }
  
  // Initialize data
  async initializeData(): Promise<void> {
    // Create admin user
    if (!(await this.getUserByUsername("admin"))) {
      await this.createUser({ username: "admin", password: "admin" });
    }
    
    // Create teams
    const teamData = [
      { name: "Royal Blue Dragons", color: "royal" },
      { name: "Ninja Turquoise", color: "turquoise" },
      { name: "Green Pythons", color: "python" },
      { name: "Yellow Hornets", color: "hornet" },
      { name: "Orange Jaguars", color: "jaguar" },
      { name: "Red Bulls", color: "bull" },
      { name: "Purple Wasps", color: "wasp" },
      { name: "Pink Panthers", color: "panther" },
      { name: "White Falcons", color: "falcon" },
      { name: "Gray Stallions", color: "stallion" },
      { name: "Brown Wolves", color: "wolf" },
      { name: "Maroon Tigers", color: "tiger" }
    ];
    
    for (const team of teamData) {
      if (!(await this.getTeamByName(team.name))) {
        await this.createTeam(team);
      }
    }
    
    // Create categories
    const categoryData = [
      { name: "VISUAL ARTS", color: "indigo" },
      { name: "QUIZ BOWL", color: "blue" },
      { name: "MUSICAL", color: "purple" },
      { name: "DANCES", color: "pink" },
      { name: "LITERARY", color: "amber" }
    ];
    
    const categoryMap: Record<string, number> = {};
    
    for (const category of categoryData) {
      const existing = Array.from(this._categories.values()).find(c => c.name === category.name);
      if (!existing) {
        const created = await this.createCategory(category);
        categoryMap[category.name] = created.id;
      } else {
        categoryMap[category.name] = existing.id;
      }
    }
    
    // Create events
    const eventData = [
      // VISUAL ARTS
      { name: "On-the-Spot Poster Making", categoryId: categoryMap["VISUAL ARTS"] },
      { name: "Pencil Drawing", categoryId: categoryMap["VISUAL ARTS"] },
      { name: "In Situ Painting", categoryId: categoryMap["VISUAL ARTS"] },
      { name: "Charcoal Rendering", categoryId: categoryMap["VISUAL ARTS"] },
      { name: "Photo Contest", categoryId: categoryMap["VISUAL ARTS"] },
      
      // QUIZ BOWL
      { name: "Quiz Bowl", categoryId: categoryMap["QUIZ BOWL"] },
      
      // MUSICAL
      { name: "Instrumental Solo (Classical Guitar)", categoryId: categoryMap["MUSICAL"] },
      { name: "Live Band", categoryId: categoryMap["MUSICAL"] },
      { name: "Vocal Solo (Kundiman)", categoryId: categoryMap["MUSICAL"] },
      { name: "Vocal Duet", categoryId: categoryMap["MUSICAL"] },
      { name: "Pop Solo", categoryId: categoryMap["MUSICAL"] },
      
      // DANCES
      { name: "Contemporary Dance", categoryId: categoryMap["DANCES"] },
      { name: "Hip-Hop", categoryId: categoryMap["DANCES"] },
      
      // LITERARY
      { name: "Pagsusulat ng Sanaysay", categoryId: categoryMap["LITERARY"] },
      { name: "Essay Writing", categoryId: categoryMap["LITERARY"] },
      { name: "Pagkukwento", categoryId: categoryMap["LITERARY"] },
      { name: "Storytelling", categoryId: categoryMap["LITERARY"] },
      { name: "Dagliang Talumpati", categoryId: categoryMap["LITERARY"] },
      { name: "Extemporaneous Speaking", categoryId: categoryMap["LITERARY"] },
      { name: "Radio Drama", categoryId: categoryMap["LITERARY"] }
    ];
    
    for (const event of eventData) {
      const existing = Array.from(this._events.values()).find(
        e => e.name === event.name && e.categoryId === event.categoryId
      );
      
      if (!existing) {
        await this.createEvent(event);
      }
    }
    
    // Initialize with no entries for all teams and events
    const teams = await this.getTeams();
    const allEvents = await this.getEvents();
    
    for (const team of teams) {
      for (const event of allEvents) {
        const existing = await this.getResultByTeamAndEvent(team.id, event.id);
        
        if (!existing) {
          await this.createResult({
            teamId: team.id,
            eventId: event.id,
            medal: MEDALS.NO_ENTRY,
            points: POINTS[MEDALS.NO_ENTRY]
          });
        }
      }
    }
  }
}

export const storage = new MemStorage();
storage.initializeData(); // Initialize data when server starts
