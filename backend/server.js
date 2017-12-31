const path = require('path');
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('/api/ticker', async (req, res) => {
    try {
        const apiResponse = await fetch('https://api.bitso.com/v3/ticker?book=xrp_mxn');
        res.json(await apiResponse.json());
    } catch (err) {
        res.json({
            success: false,
            error: {
                message: err.message,
                code: null
            }
        });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Express server running on port ${port}`));
