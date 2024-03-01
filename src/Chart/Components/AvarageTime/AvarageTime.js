import { DataGrid } from '@mui/x-data-grid';
import CobrowseAPI from 'cobrowse-agent-sdk';
import React, { useEffect, useState } from 'react';
import config from '../../../utils/config';

function AvarageTime() {
    // const [APIdata, setAPIdata] = useState([]);
    const [SessionLength, setSessionLength] = useState(null);
    const [AvargeDuration, setAvargeDuration] = useState(null);
    const [TotalDuration, setTotalDuration] = useState(null);


    const [API, setAPI] = useState([]);

    const formatedDate = (date) => {
        return date.toISOString().split('T')[0];
    };


    const today = new Date();
    const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 0);

    const formattedtwoMonthsAgo = formatedDate(twoMonthsAgo);
    const formattedToday = formatedDate(today);

    const [fromDate, setFromDate] = useState(formattedtwoMonthsAgo);
    const [toDate, setToDate] = useState(formattedToday);
    const [selectedSession, setSelectedSession] = useState(null);


    const formatDate = (inputDate) => {
        const date = new Date(inputDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        return formattedDate;
    };
    //calculateSessionDuration

    const formatedfirstDateOfMonth = formatDate(formattedtwoMonthsAgo);
    const formatedToday = formatDate(today);

    const calculateSessionDuration = (session) => {
        const activatedTime = new Date(session.activated);
        // console.log("activatedTime---", activatedTime);
        const endedTime = new Date(session.ended);
        // console.log("endedTime ---", endedTime);
        const durationInMilliseconds = endedTime - activatedTime;
        const durationInMinutes = durationInMilliseconds / (1000 * 60);
        return durationInMinutes;
    };

    


   
    

    const fetchDataforAvageTime = async (startdate, enddate) => {
        const agentToken = config.agentToken;
        const cobrowse = new CobrowseAPI(agentToken);

        try {
            const sessions = await cobrowse.sessions.list({
                activated_after: startdate,
                activated_before: enddate,
                limit: 100000,
            });
            // setSelectedSession(sessions);

            const sessionDurations = sessions.map((session) => calculateSessionDuration(session));
            const totalDuration = sessionDurations.reduce((total, duration) => total + duration, 0);
            const averageDuration = (totalDuration / sessions.length).toFixed(2);
            const sessionlength = sessions.length;
              
            setSessionLength(sessionlength);
        const formattedTotalDuration = formatDuration(totalDuration);
        const formattedaverageDuration = formatDuration(averageDuration);

            setAvargeDuration(formattedaverageDuration);
            setTotalDuration(formattedTotalDuration);
        } catch (error) {
            console.error('Error fetching cobrowse data:', error);
        }
    };
    const agentNamesSet = new Set();

    function formatDuration(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);
        const seconds = Math.round((totalMinutes % 1) * 60);
    
        let durationString = '';
        if (hours > 0) {
            durationString += `${hours} hour${hours > 1 ? 's' : ''} `;
        }
        if (minutes > 0) {
            durationString += `${minutes} minute${minutes > 1 ? 's' : ''} `;
        }
        if (seconds > 0) {
            durationString += `${seconds} second${seconds > 1 ? 's' : ''}`;
        }
    
        return durationString.trim();
    }



    API.forEach(session => {
    agentNamesSet.add(session.agent.name);
  });
            // let uniqueAgentNames = Array.from(agentNamesSet);

    useEffect(() => {
        fetchDataforAvageTime(formatedfirstDateOfMonth, formatedToday);
    }, [formatedfirstDateOfMonth, formatedToday]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        fetchDataforAvageTime(fromDate, toDate);
    };


    return (
        <div className='main-header'>
            <h1>Average Duration report table</h1>
            <div>
                <form className='dailycount1' onSubmit={handleFormSubmit}>
                    <div>
                        <label htmlFor='startDate'>From </label>
                        <input
                            type='date'
                            required
                            className='input'
                            value={fromDate}
                            onChange={(e) => {
                                setFromDate(e.target.value);
                                console.log('from date is --', e.target.value);
                            }}
                        />
                    </div>
                    <div>
                        <label htmlFor='endDate'>To </label>
                        <input
                            type='date'
                            value={toDate}
                            required
                            className='input'
                            onChange={(e) => {
                                setToDate(e.target.value);
                            }}
                        />
                    </div>
                    <div className='button'>
                        <input type='submit' className='submit-button' value='Submit' />
                    </div>
                </form>
            </div>

            <DataGrid
                className='dateTable'
                rows={[
                    {
                        id: 1,
                        sessionsHandled: SessionLength,
                        'Total Duration': TotalDuration,
                        'Average Duration': AvargeDuration,
                        // 'Agent Name' :  AgentName,
                        
                    },
                ]}
                columns={[
                    { field: 'id', headerName: 'Sr.No', width: 100 },
                    {
                        field: 'sessionsHandled',
                        headerName: 'No of Sessions',
                        width: 150,
                    },

                    { field: 'Total Duration', headerName: 'Total Duration (In Min)', width: 250 },

                    {
                        field: 'Average Duration',
                        headerName: 'Average Duration (In Min)',
                        width: 200,
                    },
                    // { field: 'AgentName', headerName: 'Agent Name', width: 200 },

                  
                ]}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                    },
                }}
                pageSizeOptions={[5, 10]}
             
            />
        </div>
    );
}

export default AvarageTime;
