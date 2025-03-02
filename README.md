# 📺 Xtream Web TV

Web application build with Node.js and Bootstrap for playing live streams of xtream codes playlist.
- The project's aim is to provide a simple interface for the bouqeuts and channels to let you qickly find and play a channel.
- An xtream code account is required.
  This application does not provide any source of streams.
- Only live tv is supported, no movies or series content.

![Projekt Screenshot](screenshot.png)

## 🚀 Installation 

### Docker compose

1. Create docker docker-compose.yml
```shsh
touch docker-compose.yml
```

2. Insert into docker-compose.yml:
```
services:
  xtream-web-tv:
    image: kolstr\xtream-web-tv
    container_name: xtream-web-tv
    restart: unless-stopped
    environment:
      - XTREAMAPIURL=http://provider.net:8080
      - XTREAMUSER=username
      - XTREAMPASSWORD=password
      - CRON_UPDATE="15 */12 * * *"
    ports:
      - "4000:4000"
    volumes:
      - ~/xtream-web-tv:/app/data
```
For an explanation of the environment variables see chapter "Configuration".

3. Start container
```sh
docker compose up -d
```
The application now runs on http://localhost:4000

### Build image manually from repository

1. Clone the repository
```sh
git clone https://git.kolstr.net/kolstr/xtream-web-tv.git
```

2. Navigate into the project directory
```sh
cd xtream-web-tv
```

3. Create .env file
```shsh
touch .env
```

4. Insert these lines into the env-file. For explanation see chapter "Configuration"
```
XTREAMAPIURL=http://provider.net:8080
XTREAMUSER=username
XTREAMPASSWORD=password
CRON_UPDATE=15 */12 * * *
```

5. Build docker image
```sh
docker build -t xtream-web-tv .
```

6. Start container
```sh
docker compose up -d
```

The application now runs on http://localhost:4000

## ⚙️ Configuration
| Env-Variable    | Explanation | Required | Default
| -------- | ------- || -------- | ------- |
| XTREAMAPIURL  | Xtreme Codes Provider URL    | Required | |
| XTREAMUSER | Your Xtream Codes username    | Required | |
| XTREAMPASSWORD    | Your Xtream Codes password    | Required  | |
| CRON_UPDATE    | Update frequency for the channel database in cron format | Optional | 15 */12 * * * |

## 🛠️ Technologies & Frameworks Used  
| Category     | Framework |
|-------------|------------|
| Frontend    | ![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white) ![hls.js](https://img.shields.io/badge/hls.js-F37820?style=for-the-badge&logo=hls.js&logoColor=white) |
| Backend     | ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)  |
| Database    | ![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white) |
| CI/CD       | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) | 
