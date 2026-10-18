import React, { useContext, useEffect } from 'react';
import './Timer.css';
import { Timerclock } from '../App';
import axios from 'axios';

function Timer() {

  const {
    timer,
    pasue,
    setpasue,
    timeleft,
    settimeleft,
    session,
    setsession
  } = useContext(Timerclock);


  const start = () => {
    setpasue(true);
  };


  const togglePause = () => {
    setpasue(prev => !prev);
  };


  const reset = () => {
    settimeleft(timer);
    setpasue(false);
  };


  // Timer countdown
  useEffect(() => {

    if (!pasue) return;

    if (timeleft <= 0) {
      completeSession();
      return;
    }

    const interval = setInterval(() => {
      settimeleft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);

  }, [pasue, timeleft]);


  // When 1 hour is completed
  const completeSession = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://localhost:9000/timer",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

     
      setsession(response.data.session);

    
      settimeleft(timer);

    
      setpasue(false);

    } catch (error) {

      console.error("Session save error:", error);

    }
  };


  function re() {

    const min = Math.floor(timeleft / 60);
    const sec = Math.floor(timeleft % 60);

    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  }


  return (
    <>
      <div className="clock">

        <div className="timer">

          <div className="running">
            {re()}
          </div>

          <center>
            <p>Session Count : {session}</p>
          </center>

          <div className="button">

            <button onClick={start}>
              Start
            </button>

            <button onClick={togglePause}>
              {pasue ? "Pause" : "Continue"}
            </button>

            <button onClick={reset}>
              Reset
            </button>

            <button
              className="btn btn-danger"
              onClick={reset}
            >
              End
            </button>

          </div>

        </div>

      </div>
    </>
  );
}

export default Timer;