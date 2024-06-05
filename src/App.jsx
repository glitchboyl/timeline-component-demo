import WorkbenchPanel from "./components/WorkbenchPanel";
import TimelinePanel from "./components/TimelinePanel";

const App = () => {
  return (
    <div className="w-full h-screen flex flex-row">
      <WorkbenchPanel />
      <TimelinePanel />
    </div>
  );
};

export default App;
