const request = require("supertest");
const http = require("http");
const { app, getAllStocks, addTrade } = require("../index.js");

let server;

beforeAll(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(3010, resolve));
  console.log("Test server is running on:", server.address());
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  console.log("Test server closed.");
});

describe("API to test getting all stocks", () => {
  it("should return all stocks", async () => {
    const res = await request(server).get("/stocks");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      stocks: [
        {
          stockId: 1,
          ticker: "AAPL",
          companyName: "Apple Inc.",
          price: 150.75,
        },
        {
          stockId: 2,
          ticker: "GOOGL",
          companyName: "Alphabet Inc.",
          price: 2750.1,
        },
        {
          stockId: 3,
          ticker: "TSLA",
          companyName: "Tesla, Inc.",
          price: 695.5,
        },
      ],
    });
  });
});

describe("API to test retrieving a specific stock by ticker symbol.", () => {
  it("should return a stock by ticker", async () => {
    const res = await request(server).get("/stocks/AAPL");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      stock: {
        stockId: 1,
        ticker: "AAPL",
        companyName: "Apple Inc.",
        price: 150.75,
      },
    });
  });

  it("should return a status 404 if invalid ticker", async () => {
    const res = await request(server).get("/stocks/APPLE");
    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      error: "Stock not found",
    });
  });
});

describe("API to test add a trade", () => {
  it("should add a trade", async () => {
    const res = await request(server).post("/trades/new").send({
      stockId: 1,
      quantity: 15,
      tradeType: "buy",
      tradeDate: "2024-08-08",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      trade: {
        tradeId: 4,
        stockId: 1,
        quantity: 15,
        tradeType: "buy",
        tradeDate: "2024-08-08",
      },
    });
  });

  it("should not add a trade when an invalid body is provided", async () => {
    const res = await request(server).post("/trades/new").send({
      quantity: 15,
      tradeType: "buy",
      tradeDate: "2024-08-08",
    });
    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      error: "Missing required trade details",
    });
  });
});

jest.mock("../index.js", () => ({
  ...jest.requireActual("../index.js"),
  getAllStocks: jest.fn(),
  getStockByTicker: jest.fn(),
  addTrade: jest.fn(),
}));

describe("function tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getAllStocks should return all the stocks", () => {
    const mockStocks = [
      {
        stockId: 1,
        ticker: "AAPL",
        companyName: "Apple Inc.",
        price: 150.75,
      },
      {
        stockId: 2,
        ticker: "GOOGL",
        companyName: "Alphabet Inc.",
        price: 2750.1,
      },
    ];

    getAllStocks.mockReturnValue(mockStocks);

    let result = getAllStocks();
    expect(result).toEqual(mockStocks);
    expect(getAllStocks).toHaveBeenCalled();
  });

  test("addTrade should add trade", () => {
    const newTrade = {
      stockId: 1,
      ticker: "AAPL",
      companyName: "Apple Inc.",
      price: 150.75,
    };

addTrade.mockReturnValue(newTrade)

    let result = addTrade(newTrade);
    expect(result).toEqual(newTrade);
    expect(addTrade).toHaveBeenCalledWith(newTrade);
  });
});
