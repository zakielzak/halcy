import "./App.css";
import HeaderButtons from "./components/HeaderButtons";

function App() {
  
  return (
    <main className="layout select-none antialiased bg-[#fafafc] h-screen w-screen font-outfit overflow-hidden">
      <HeaderButtons></HeaderButtons>
      <h1 className="text-amber-200">Hello World</h1>
    </main>
  );
}

export default App;
