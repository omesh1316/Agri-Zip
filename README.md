Project: AI-Agri-Assistant / Agri-Zip
Summary: Full-stack agriculture assistant with a Flask backend (models, DB utilities, weather API, e-commerce endpoints) and a React frontend. This README explains how to set up the project from scratch on Windows using PowerShell: create virtual environments, install libraries, configure environment variables and database, and run both backend and frontend.
Prerequisites:

Python 3.10+: Install from python.org and add to PATH.
Node.js 16+ / npm: Install from nodejs.org.
Git: Install from git-scm.com.
(Optional) Git LFS: Required if you want to push or pull large model files. Install from https://git-lfs.github.com/.
(Optional) MySQL: If you plan to use MySQL instead of the included local DB files.
PowerShell: Use the default Windows PowerShell. Commands below are PowerShell-compatible

Repository layout (relevant):

backend : Flask app (app.py), models, utilities, requirements.txt, database helpers
frontend : React SPA source (public/, src/) and .env
mysql-connection-project : example MySQL connection helper
1) Clone repository

If you haven't already:
git clone https://github.com/omesh1316/Agri-Zip.git
cd Agri-Zip

2) Git LFS (recommended for model files):

If the repo uses large models (*.pkl, *.h5, *.pt, etc.) you should install and use Git LFS. To install and enable:
# Install (one-time)
choco install git-lfs -y   # if you have Chocolatey
# or download from https://git-lfs.github.com/

# Enable for this repo
git lfs install
# Track common model/data files
git lfs track "*.pkl"
git lfs track "*.h5"
git lfs track "*.pt"
git add .gitattributes
git commit -m "Track model files with Git LFS"

Note: If your cloned repo already failed pushing due to large files, do not re-add large files to history — use git lfs before adding them or use a history cleaning tool (BFG / git filter-repo).
3) Backend setup (Python / Flask)

Create and activate a Python virtual environment inside backend:
cd .\backend
python -m venv .venv
# Activate
.venv\Scripts\Activate.ps1
# If execution policy blocks activation, run as admin:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

Upgrade pip and install requirements:
pip install flask flask-cors pandas numpy scikit-learn xgboost tensorflow pillow requests sqlalchemy

(Adjust versions if needed — see requirements.txt for exact dependencies.)

4) Environment variables & configuration

Backend may expect database connection strings, secret keys or API keys (e.g., weather API). Create a .env inside backend (or set env vars in PowerShell). Example variables and how to set them in PowerShell:

# Example environment variables (set per session)
$env:FLASK_APP = "app.py"
$env:FLASK_ENV = "development"
$env:DB_TYPE = "sqlite"           # or "mysql"
$env:DB_PATH = ".\data\database.db"
$env:MYSQL_HOST = "localhost"
$env:MYSQL_USER = "youruser"
$env:MYSQL_PASSWORD = "yourpassword"
$env:MYSQL_DB = "yourdbname"
$env:WEATHER_API_KEY = "your_weather_api_key"

Alternatively, create backend/.env with KEY=VALUE lines and use python-dotenv (often included in requirements.txt) to automatically load the file.
5) Database setup

The repo includes local DB files (e.g., ecom.db) in some configurations. To create or initialize the DB using project scripts:
# (while .venv activated)
python db_setup.py
# or
python check_db.py

If you want to use MySQL:
Install MySQL and create a database and user.
Update env vars (MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB).
Run the provided connector or migration scripts inside mysql-connection-project:

cd .\mysql-connection-project
# Edit connect_mysql.py with your credentials then
python connect_mysql.py

6) Preparing model files

Model files (.pkl, .h5) may be large and are usually not committed. If the models are not present, either:
Download them from the original source (provide URL if you have one), or
Train them locally using training scripts:

# Example: train crop/disease models (may take time)
python ..\train_crop_model.py
python ..\train_disease_model.py

If you have model files to add to the repo, use git lfs as shown earlier before adding/committing them.

7) Run the backend

With the venv activated and environment variables set:
# Run Flask directly
python app.py
# or with flask CLI (if using FLASK_APP)
flask run --host=0.0.0.0 --port=5000

The backend should now listen on http://localhost:5000 (or whichever port is configured).
8) Frontend setup (React)

From the project root or frontend folder:
cd ..\frontend

If package.json is present:
npm install
npm start

If package.json is missing (some repo states may not include it), create a new React app or recover the frontend package file:
# OPTION A: recreate project in-place (this will create package.json)
npx create-react-app .   # careful: this will scaffold a new React app in folder
# Then copy your existing `src/` and `public/` into the newly created project folder,
# and reinstall any needed packages, e.g.:
npm install axios react-router-dom i18next
npm start

The dev server typically runs at http://localhost:3000 and will proxy API calls if configured in package.json/setupProxy.js. Check .env for proxy or API base URL.

9) Integrating frontend and backend

Confirm the frontend is configured to call the backend endpoints, typically by:
Setting a REACT_APP_API_URL in .env:
# Example
$env:REACT_APP_API_URL = "http://localhost:5000/api"
# or add to frontend/.env:
# REACT_APP_API_URL=http://localhost:5000/api
Start backend first, then frontend.

10) Common commands summary (PowerShell)

Clone:
git clone https://github.com/omesh1316/Agri-Zip.git
cd Agri-Zip

Backend venv and install:
cd .\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt

Run backend:
$env:FLASK_APP = "app.py"
$env:FLASK_ENV = "development"
flask run
# or
python app.py

Frontend (if package.json present):
cd ..\frontend
npm install
npm start

Git LFS usage (one-time and tracking):
git lfs install
git lfs track "*.pkl"
git lfs track "*.h5"
git add .gitattributes
git commit -m "Track model files with Git LFS"

11) Removing local virtual env / node modules from repo and .gitignore

Make sure you never commit virtual environments or node_modules. Add these entries to .gitignore at repo root:
# Python envs
/backend/agrienv/
/backend/.venv/
/env/
/venv/
*.env

# Node
/frontend/node_modules/
/node_modules/
/frontend/.cache/
/.cache/

# Models / large files
*.pkl
*.h5
*.pt
*.db
*.sqlite
*.mp4

If the repo accidentally has committed those files already and you want to remove them from history, use BFG or git filter-repo. Example (BFG approach):
Install BFG and run on a fresh clone (this rewrites history — coordinate with collaborators):

# From an empty clone directory
bfg --delete-folders agrienv --delete-files "*.mp4" --delete-files "node_modules" --delete-files "*.dll"
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force

12) Troubleshooting

"Module not found" errors: ensure venv activated and pip install -r requirements.txt succeeded.
Port in use errors: change port or stop the process using the port.
Large file push rejected: install git lfs or remove the file from history.
Execution policy prevents venv activation: run Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned in elevated PowerShell (admin).
13) Security & deployment notes

Do not commit secrets (API keys, DB passwords). Store them in .env and add .env to .gitignore.
For production, consider containerizing backend (Docker) and serving the frontend as static files or via a CDN.
Use CI/CD or GitHub Actions to run tests and deploy.
14) Where to go next (suggestions I can do for you)

Add a polished README.md file to the repository (I can create it).
Create a proper frontend/package.json if it's missing (I can generate one and install matching deps).
Configure git lfs and move large model files to LFS.
Clean git history (BFG/git filter-repo) if you want to permanently remove large committed files.
If you'd like, I can:

Save this content to README.md in the repository and commit it, then push.
Inspect requirements.txt and generate a locked requirements.txt with pinned versions.
Create or restore frontend/package.json and run npm install for you.
