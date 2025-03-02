const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/xtream.db');
require('dotenv').config();

const apiUrl = process.env.XTREAMAPIURL;
const username = process.env.XTREAMUSER;
const password = process.env.XTREAMPASSWORD;

//Create tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        name TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS channels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stream_id INTEGER,
        name TEXT NOT NULL,
        icon TEXT,
        category_id INTEGER,
        num INTEGER,
        FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
    )`);
    checkAndUpdateTables();
});

function checkAndUpdateTables() {
    db.get('SELECT COUNT(*) AS count FROM categories', (err, row) => {
        if (err) {
            console.error('Fehler bei der Abfrage:', err.message);
            return;
        }
        if (row.count === 0) {
            console.log('Table categories is empty.');
            updateTables();
        }
    });
}

function updateTables() {
    console.log("Updating database...");
    db.serialize(() => {
        db.run('DELETE FROM channels');
        db.run('DELETE FROM categories', (err) => {
            if (err) {
                console.error('Fehler beim Leeren der Tabellen:', err.message);
                return;
            }
            console.log('Truncated tables');
        });
    });
    getStreams();
}

// Account-Information
const getAccount = async () => {
    const account = await axios.get(`${apiUrl}/player_api.php?username=${username}&password=${password}`);
    return account.data;
};

// Streams by categorie
const getStreamsByCategory = async (category_id) => {
    const streams = await axios.get(`${apiUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams&category_id=${category_id}`);
    return streams.data;
};

const getStreams = async () => {
    try {
        const categoriesResponse = await axios.get(`${apiUrl}/player_api.php?username=${username}&password=${password}&action=get_live_categories`);
        const categories = categoriesResponse.data;

        for (const category of categories) {
            console.log("Inserting " + category.category_name + "...");
            await new Promise((resolve, reject) => {
                db.run('INSERT INTO categories (category_id, name) VALUES (?, ?)', [category.category_id, category.category_name], function (err) {
                    if (err) {
                        console.log(err.message);
                        return reject(err);
                    }
                    resolve();
                });
            });

            const streams = await getStreamsByCategory(category.category_id);
            await Promise.all(streams.map(stream => {
                return new Promise((resolve, reject) => {
                    db.run(
                        'INSERT INTO channels (stream_id, name, icon, num, category_id) VALUES (?, ?, ?, ?, ?)',
                        [stream.stream_id, stream.name, stream.stream_icon, stream.num, category.category_id],
                        function (err) {
                            if (err) {
                                console.log(err.message);
                                return reject(err);
                            }
                            resolve();
                        }
                    );
                });
            }));
        }
        return categories;
    } catch (error) {
        console.error('Error fetching streams:', error);
        return [];
    }
};

// Kategorien mit Streams abrufen
async function getCategoriesWithStreams() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM categories ORDER BY id ASC', async (err, categories) => {
            if (err) return reject(err);
            try {
                const categoryPromises = categories.map(category => {
                    return new Promise((resolve, reject) => {
                        db.all('SELECT * FROM channels WHERE category_id = ? ORDER BY num ASC', [category.category_id], (err, channels) => {
                            if (err) return reject(err);
                            category.streams = channels;
                            resolve(category);
                        });
                    });
                });
                const results = await Promise.all(categoryPromises);
                resolve(results);
            } catch (error) {
                reject(error);
            }
        });
    });
}

module.exports = {
    getAccount,
    getStreams,
    getStreamsByCategory,
    getCategoriesWithStreams,
    updateTables
};
