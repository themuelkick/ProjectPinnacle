import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PlayerDetail from "./pages/PlayerDetail";
import DrillDetail from "./pages/DrillDetail";
import CreatePlayer from "./pages/CreatePlayer";
import CreateDrill from "./pages/CreateDrill";

// Encyclopedia imports
import Encyclopedia from "./pages/Encyclopedia/Encyclopedia";
import ConceptList from "./pages/Encyclopedia/ConceptList";
import ConceptDetail from "./pages/Encyclopedia/ConceptDetail";
import ConceptForm from "./pages/Encyclopedia/ConceptForm";

function App() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/ibg.jpg')" }}
    >
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Create routes */}
        <Route path="/players/new" element={<CreatePlayer />} />

        {/* Note: navigate("/drills/new") in Encyclopedia.jsx
            must match this path exactly.
        */}
        <Route path="/drills/new" element={<CreateDrill />} />

        {/* Player detail (sessions handled internally) */}
        <Route path="/players/:id" element={<PlayerDetail />} />

        {/* Encyclopedia with nested routes */}
        <Route path="/encyclopedia" element={<Encyclopedia />}>
          <Route index element={<ConceptList />} />
          <Route path="new" element={<ConceptForm />} />
          <Route path=":conceptId/edit" element={<ConceptForm isEdit />} />

          {/* Standard Concept detail view.
              If the item is a 'drill', your ConceptDetail component
              should check the 'type' and render accordingly.
          */}
          <Route path=":conceptId" element={<ConceptDetail />} />
        </Route>

        {/* Global Drill detail (outside encyclopedia).
            This is used for the assigned drills in player profiles.
        */}
        <Route path="/drills/:id" element={<DrillDetail />} />
      </Routes>
    </div>
  );
}

export default App;