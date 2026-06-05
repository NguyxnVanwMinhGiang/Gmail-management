import {useState} from "react";

function Popup(){
    const [isOpen, setIsOpen] = useState(false);
    const userConfirmed: boolean = window.confirm("Do you want to proceed?");

    const togglePopup = () => {
        if (userConfirmed) {
            setIsOpen(!isOpen);
            console.log("User clicked OK (Yes)");
        } else {
            console.log("User clicked Cancel (No)");
        }
    };

    return (
        <div>
            <button onClick={togglePopup}>Open Popup</button>
            {isOpen && (
                <div className="popup">
                    <p>This is a popup message!</p>
                    <button onClick={togglePopup}>Close Popup</button>
                </div>
            )}
        </div>
    );
}

export default Popup;