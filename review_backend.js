const express = require(express);
const bodyparser = require(body-parser);
const cassandra = require(cassandra-driver);

const app = express();
const PORT = 3000;

app.use(bodyParser.json())
const client = new cassandra.Client({
	contactPoints: ["127.0.0.1"],
	localDataCenter: "datacenter1",
	keyspace: "bookreviews",
});
const initializeDatabase = async () => {
  try {
    await client.execute(`
      CREATE KEYSPACE IF NOT EXISTS bookreviews
      WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
      }
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY,
        isbn TEXT,
        review TEXT,
        rating INT,
        username TEXT,
        created_at TIMESTAMP
      )
    `);

    console.log("Database initialized.");
  } catch (error) {
    console.error("Error initializing database:", error.message);
  }
};
app.post("/submit-review", async (req, res) => {
  const { isbn, review, rating, username } = req.body;

  if (!isbn || !review || !rating || !username) {
    return res.status(400).json({ error: "All fields are required!" });
  }
  try {
 	const id = cassandra.types.Uuid.random();
	const query = '
		const query = `
     			 INSERT INTO reviews (id, isbn, review, rating, username, created_at)
     			 VALUES (?, ?, ?, ?, ?, ?)
   			 `;
   		 const params = [id, isbn, review, rating, username, new Date()];

   		 await client.execute(query, params, { prepare: true });

   		 res.status(201).json({
   			 message: "Review saved successfully!",
   			 data: { id, isbn, review, rating, username },
   		 });
	 } catch (error) {
  	   console.error("Error saving review:", error.message);
   	   res.status(500).json({ error: "Failed to save review." });
 	  }
	});
app.get("/reviews", async (req, res) => {
  try {
    const query = "SELECT * FROM reviews";
    const result = await client.execute(query);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching reviews:", error.message);
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
});
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await initializeDatabase();
});
