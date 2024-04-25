import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

export default function SimpleLineChart(props) {
    let tData = [];
    let xLabels = [];
    //console.log("SimpleLineChart", props);
    for (let i of props.data) {
        xLabels.push(i.fcstTime);
        tData.push(i.T1H);
    }    
  return (
    <LineChart
      width={500}
      height={300}
      series={[
        { data: tData, label: '기온(℃)', yAxisKey: 'leftAxisId' }
      ]}
      xAxis={[{ scaleType: 'point', data: xLabels }]}
      yAxis={[{ id: 'leftAxisId' }]}
    />
  );
}

// LineChart 용 설치
//npm install @mui/x-charts

// 출처: https://mui.com/x/react-charts/line-demo/