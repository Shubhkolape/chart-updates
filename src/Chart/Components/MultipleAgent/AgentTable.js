import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import CobrowseAPI from 'cobrowse-agent-sdk';
import { React, useEffect, useState } from 'react';
import config from '../../../utils/config';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function AgentTable() {


const formatedDate = (date) => {
    return date.toISOString().split('T')[0];
};


const today = new Date();
const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 0);

const formattedtwoMonthsAgo = formatedDate(twoMonthsAgo);
const formattedToday = formatedDate(today);


const [monthlyCounts, setMonthlyCounts] = useState({});

const [agentNames, setAgentNames] = useState([]);

const monthNumberToWord = (monthNumber) => {
  const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
  ];
  return months[monthNumber - 1]; // Adjusting for array index starting at 0
};

const fetchData = async (startDate, endDate) => {
  const agentToken = config.agentToken;
  const cobrowse = new CobrowseAPI(agentToken);

  try {
      const sessions = await cobrowse.sessions.list({
          activated_after: startDate,
          activated_before: endDate,
          limit: 10000,
      });

      const agentNames = sessions.map(session => session.agent.name).slice(0, 3);
      setAgentNames(agentNames);

      const monthly = {};
      sessions.forEach((item) => {
          const date = new Date(item.created);
          const monthYear = `${monthNumberToWord(date.getMonth() + 1)}-${date.getFullYear()}`;
          monthly[monthYear] = (monthly[monthYear] || 0) + 1;
      });
      const sortedMonthly = Object.fromEntries(
          Object.entries(monthly).sort(([a], [b]) => {
              const [aMonth, aYear] = a.split('-');
              const [bMonth, bYear] = b.split('-');
              return bYear - aYear || bMonth - aMonth;
          }),
      );
      console.log('sortedMonthly----', sortedMonthly);
      setMonthlyCounts(sortedMonthly);
      // setAPIdata(sessions);
      console.log('sessions ----', sessions);
  } catch (error) {
      console.error('Error fetching cobrowse data:', error);
  }
};

useEffect(() => {
  fetchData(formattedtwoMonthsAgo, formattedToday);
}, [formattedtwoMonthsAgo, formattedToday]);


const sortedKeys = Object.keys(monthlyCounts).sort((a, b) => {
  const [monthA, yearA] = a.split('-').map(Number);
  const [monthB, yearB] = b.split('-').map(Number);
  // Sort by year in descending order
  if (yearA !== yearB) {
      return yearB - yearA;
  }
  // If years are equal, sort by month in descending order
  return monthB - monthA;
});
sortedKeys.reverse();
// Construct a new object using the sorted keys
const sortedData = {};
sortedKeys.forEach((key) => {
  sortedData[key] = monthlyCounts[key]; // Access monthlyCounts instead of data
});
const keys = Object.keys(sortedData);
console.log("keys are 1 march ------>", keys);
const values = Object.values(sortedData);
console.log("values are ------> 1 march ", values);




  return (
    <div  className='license-info'>
      <h2> Multiple Agent Monthly Session Report Table</h2>
       <table className='license-table-agent'>
        <thead>
          <tr>
            <th className="centered-header" >#</th>
            <th className="centered-header" >Agent Name</th>
            {keys.map(key => <th className="centered-header" key={key}>{key}</th>)}
          </tr>
        </thead>
        <tbody>
          {agentNames.map((agent, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{agent}</td>
              {keys.map(key => <td key={key}>{monthlyCounts[key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AgentTable