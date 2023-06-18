import SettingsBar from "./components/SettingsBar";
import Toolbar from "./components/ToolBar";
import Canvas from "./components/Canvas";
import { useRef } from "react";
import { useState } from "react";
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'

import "./styles/app.scss"

function App() {
  return (

    <BrowserRouter>
      <div className="app">
        <Switch>
          <Route path='/:id'>
            <Toolbar />
            <SettingsBar />
            <Canvas />
          </Route>
          <Redirect to={`f${(+new Date).toString(16)}`} />
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default App;
