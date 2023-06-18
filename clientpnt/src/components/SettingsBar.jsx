import React from "react";
import '../styles/toolbar.scss'
import toolState from "../store/toolState";

const SettingsBar = () => {
    return (
        <div className="settings-bar">
            <label htmlFor="line-width" style={{ margin: '0 0 0 20px' }}>Line width:</label>
            <input
                onChange={e => toolState.setLineWidth(e.target.value)}
                style={{ margin: '0 10px' }} id="line-width" type="number" defaultValue={1} min={1} max={60}></input>
            <label htmlFor="border-color">Border color:</label>
            <input
                onChange={e => toolState.setStrokeColor(e.target.value)}
                style={{ margin: '0 10px' }} id="border-color" type="color"></input>
        </div >
    );
}

export default SettingsBar; 