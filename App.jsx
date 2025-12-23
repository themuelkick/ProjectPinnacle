import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PlayerDetail from "./pages/PlayerDetail";
import DrillDetail from "./pages/DrillDetail";
import CreatePlayer from "./pages/CreatePlayer";
import CreateDrill from "./pages/CreateDrill";
import Navbar from "./components/navbar/navbar";
// Encyclopedia imports
import Encyclopedia from "./pages/Encyclopedia/Encyclopedia";
import ConceptList from "./pages/Encyclopedia/ConceptList";
import ConceptDetail from "./pages/Encyclopedia/ConceptDetail";
import ConceptForm from "./pages/Encyclopedia/ConceptForm";

// FIXED IMPORT: Changed from ../ to ./
import TechBackground from "./components/TechBackground/TechBackground";

function App() {
  return (
    /* The main wrapper div solves the "Adjacent JSX elements" error */
    <div className="min-h-screen bg-transparent relative">

      {/* 1. Animated Layer */}
      <TechBackground />

      {/* 2. Content Layer (lifts text above the animation) */}
      <div className="relative z-10">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/players/new" element={<CreatePlayer />} />
          <Route path="/drills/new" element={<CreateDrill />} />
          <Route path="/players/:id" element={<PlayerDetail />} />

          <Route path="/encyclopedia" element={<Encyclopedia />}>
            <Route index element={<ConceptList />} />
            <Route path="new" element={<ConceptForm />} />
            <Route path=":conceptId/edit" element={<ConceptForm isEdit />} />
            <Route path=":conceptId" element={<ConceptDetail />} />
          </Route>

          <Route path="/drills/:id" element={<DrillDetail />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;