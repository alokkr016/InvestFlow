const express = require("express");
const { resolve } = require("path");

const app = express();
const port = 3010;

app.use(express.static("static"));
app.use(express.json());

let stocks = [
  { stockId: 1, ticker: "AAPL", companyName: "Apple Inc.", price: 150.75 },
  { stockId: 2, ticker: "GOOGL", companyName: "Alphabet Inc.", price: 2750.1 },
  { stockId: 3, ticker: "TSLA", companyName: "Tesla, Inc.", price: 695.5 },
];

let trades = [
  {
    tradeId: 1,
    stockId: 1,
    quantity: 10,
    tradeType: "buy",
    tradeDate: "2024-08-07",
  },
  {
    tradeId: 2,
    stockId: 2,
    quantity: 5,
    tradeType: "sell",
    tradeDate: "2024-08-06",
  },
  {
    tradeId: 3,
    stockId: 3,
    quantity: 7,
    tradeType: "buy",
    tradeDate: "2024-08-05",
  },
];

async function getAllStocks() {
  return { stocks: stocks };
}

app.get("/stocks", async (req, res) => {
  try {
    let response = await getAllStocks();
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching stocks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function getStockByTicker(ticker) {
  let stock = stocks.find((stock) => stock.ticker === ticker);
  return { stock: stock };
}

app.get("/stocks/:ticker", async (req, res) => {
  try {
    let ticker = req.params.ticker;
    let response = await getStockByTicker(ticker);
    if (!response.stock) {
      return res.status(404).json({ error: "Stock not found" });
    }
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching stock by ticker:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function addTrade(tradeBody) {
  let trade = { tradeId: trades.length + 1, ...tradeBody };
  trades.push(trade);
  return { trade: trade };
}

app.post("/trades/new", async (req, res) => {
  try {
    let tradeBody = req.body;

    // Validate the tradeBody for required fields
    if (
      !tradeBody.stockId ||
      !tradeBody.quantity ||
      !tradeBody.tradeType ||
      !tradeBody.tradeDate
    ) {
      return res.status(404).json({ error: "Missing required trade details" });
    }
    
    // Add the new trade if validation passes
    let result = await addTrade(tradeBody);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding trade:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/", (req, res) => {
  res.sendFile(resolve(__dirname, "pages/index.html"));
});

// Avoid starting the server during tests
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}

module.exports = { app, getAllStocks, getStockByTicker, addTrade };
