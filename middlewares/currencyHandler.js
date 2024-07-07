import axios from 'axios';

const currencyHandler = async (req, res, next) => {
    console.log(req.headers);
    const basecode = 'INR';
    let changecode = 'INR';

    if (req.headers.currency) {
        changecode = req.headers.currency;
        console.log(changecode)
    }
    
    try {
        const response = await axios.get(`https://api.currencyapi.com/v3/latest?apikey=${process.env.apikey}&currencies=${changecode}&base_currency=${basecode}`);
        req.Currency = response.data.data[changecode].value;
        next();
    } catch (error) {
        console.error("Error fetching currency data:", error);
        return res.status(500).send({ error: "Internal Server Error: Unable to fetch currency data" });
    }
};

export default currencyHandler;
