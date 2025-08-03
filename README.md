# ShiftWise

**A shift scheduling management system for shift-based businesses.**  
The system includes employee management, availability input, vacation requests, task assignment, internal chat, and semi-automatic scheduling based on availability and preferences.

---

## 🛠️ Installation Instructions

### Client

```bash
cd client
npm install
npm start
```

### Server

```bash
cd server
npm install
node server.js
```

## 🔍 Key Code Sections

## 🔍 Key Code Sections

🔹 [schedulerService.js](https://github.com/dorlevi7/ShiftWise/blob/main/server/services/schedulerService.js)  
Implements the logic for assigning employees to shifts based on weekly availability and business rules. Ensures that each employee is assigned to at most one shift per day and that the number of assigned employees per shift matches the required capacity. Supports both manual and semi-automatic scheduling by the admin.

🔹 [availabilityService.js](https://github.com/dorlevi7/ShiftWise/blob/main/server/services/availabilityService.js)  
Handles the saving and loading of weekly availability. Supports both employee-side input and admin-side filling on behalf of employees. Manages status updates (default, selected, disabled) with logic that reflects rules such as one shift per day, night-to-morning conflicts, and capacity limits.

🔹 [notificationService.js](https://github.com/dorlevi7/ShiftWise/blob/main/server/services/notificationService.js)  
Sends notifications between users for various actions: shift offer requests, swap proposals, acceptance/decline responses, admin approvals, and weekly availability reminders.

🔹 [ScheduleScreen.js](https://github.com/dorlevi7/ShiftWise/blob/main/client/src/components/ScheduleScreen.js)  
Renders the weekly shift schedule grid, displays all employees, and supports manual shift assignment. Enables employees to offer or request swaps and handles highlighting and interaction logic. Admin can toggle between admin and employee views, review requests, and approve changes.

🔹 [StatisticsScreen.js](https://github.com/dorlevi7/ShiftWise/blob/main/client/src/components/StatisticsScreen.js)  
Displays a per-user breakdown of night, Shabbat, and regular shifts over multiple weeks. Includes sortable tables and comparison bar charts for performance tracking and fairness analysis.

## 👤 Author

Dor Levi
Software Engineering Student
GitHub: @dorlevi7
