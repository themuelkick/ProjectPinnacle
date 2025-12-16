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
    <Routes>
      {/* Dashboard */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/players/new" element={<CreatePlayer />} />
      <Route path="/drills/new" element={<CreateDrill />} />
      <Route path="/players/:id" element={<PlayerDetail />} />
      <Route path="/drills/:id" element={<DrillDetail />} />

      {/* Encyclopedia with nested routes */}
      <Route path="/encyclopedia" element={<Encyclopedia />}>
        <Route index element={<ConceptList />} />
        <Route path="new" element={<ConceptForm />} />
        <Route path=":conceptId/edit" element={<ConceptForm isEdit={true} />} />
        <Route path=":conceptId" element={<ConceptDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
