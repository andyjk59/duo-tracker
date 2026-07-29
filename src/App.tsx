import { HashRouter, Routes, Route } from "react-router-dom";
import { AppDataProvider } from "./data/AppDataContext";
import ModeChooser from "./pages/ModeChooser";
import ProfileHome from "./pages/ProfileHome";
import CalendarHome from "./pages/CalendarHome";
import DayView from "./pages/DayView";
import WorkoutSession from "./pages/WorkoutSession";
import ViewOtherProfile from "./pages/ViewOtherProfile";
import "./App.css";

function App() {
  return (
    <AppDataProvider>
      <HashRouter>
        <div className="app-shell">
          <Routes>
            <Route path="/" element={<ModeChooser />} />

            <Route path="/personA" element={<ProfileHome person="personA" />} />
            <Route path="/personA/logs" element={<CalendarHome person="personA" />} />
            <Route path="/personA/logs/day/:dateKey" element={<DayView person="personA" />} />
            <Route path="/personA/logs/day/:dateKey/workout/:templateId" element={<WorkoutSession person="personA" />} />
            <Route path="/personA/view" element={<ViewOtherProfile viewing="personB" />} />

            <Route path="/personB" element={<ProfileHome person="personB" />} />
            <Route path="/personB/logs" element={<CalendarHome person="personB" />} />
            <Route path="/personB/logs/day/:dateKey" element={<DayView person="personB" />} />
            <Route path="/personB/logs/day/:dateKey/workout/:templateId" element={<WorkoutSession person="personB" />} />
            <Route path="/personB/view" element={<ViewOtherProfile viewing="personA" />} />
          </Routes>
        </div>
      </HashRouter>
    </AppDataProvider>
  );
}

export default App;
