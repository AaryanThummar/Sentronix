# File & Malware Defense Scanner Tasks

- [x] **1. Backend Threat Detection API**
  - [x] Create `backend/app/api/v1/defense.py` router
  - [x] Implement regex-based malware threat scanning logic
  - [x] Save threats to `UnifiedFinding` in the database
  - [x] Register new router in `backend/app/main.py`
- [x] **2. Frontend Integration**
  - [x] Re-layout `ScansPage.jsx` to support dual cards
  - [x] Implement file upload and scan execution for malware threats
- [x] **3. Verification**
  - [x] Run both the frontend and backend servers
  - [x] Scan an EICAR test string and verify it propagates to the Dashboard page

# Pillar 1: Application & Code-Level Defense Tasks
- [x] **1. Backend Workers & Tasks**
  - [x] Create Celery tasks in `tasks_app_defense.py`
  - [x] Register tasks in `celery_app.py`
- [x] **2. API Endpoints**
  - [x] Create endpoints in `api/v1/app_defense.py`
  - [x] Register endpoints in `main.py`
- [x] **3. Frontend Tab Integration**
  - [x] Create `AppDefenseTab.jsx`
  - [x] Integrate tab selector into `DashboardPage.jsx`
- [x] **4. Docker Environment**
  - [x] Verify Docker daemon online
  - [x] Start services via Docker Composes immediately
