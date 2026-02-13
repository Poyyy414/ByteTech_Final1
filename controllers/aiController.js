require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.predictEnvironment = async (req, res) => {
  try {
    const { temperature_c, humidity, co2_density, heat_index_c } = req.body;

    const prompt = `
    Analyze this environmental data:
    Temperature: ${temperature_c}°C
    Humidity: ${humidity}%
    CO2 Density: ${co2_density} ppm
    Heat Index: ${heat_index_c}°C
    
    Predict:
    1. Risk level (LOW, NORMAL, HIGH, VERY HIGH)
    2. If trend is increasing or decreasing
    3. Recommendation
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      prediction: response.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI prediction failed" });
  }
};
