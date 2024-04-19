import '../App.css';
import axios from 'axios';
import {useState, useEffect} from 'react';
import DataTable from "./dataTable";

function WeatherInfo(props) {
  console.log( "WeatherInfo22 start:: props", props );
  const URL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selPos, setSelPos] = useState(null);

  let nx, ny;
  const today = new Date(); // 현재 날짜를 가져옵니다.
  const formattedDate = today.getFullYear()
                      + ('0'+(today.getMonth()+1)).slice(-2)
                      + ('0'+today.getDate()).slice(-2);// 원하는 형식(YYYYMMDD)으로 날짜를 설정합니다.

  const formattedHours = String(today.getHours()-1).padStart(2, "0")+"00";

  if(props.nPosX === undefined) { nx = '53';  } else { nx = props.nPosX; }
  if(props.nPosY === undefined) { ny = '38'; } else { ny = props.nPosY; }


  const fetchData = async () => {
    try {
      setError(null);
      setData(null);
      setLoading(true);
      console.log( process.env.REACT_APP_API_KEY );
      console.log( "ApiDataGoKr fetchData.xy",  nx, ny );
      
      const response = await axios.get(URL, {
          params: {
            serviceKey: process.env.REACT_APP_API_KEY,
            numOfRows: 0,
            pageNo: 1,
            base_date: formattedDate,
            base_time: formattedHours,
            nx: nx,
            ny: ny,
            dataType: "JSON"
          }
      });
      setData(response.data);
    } catch(e) {
      setError(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if(loading) return <div>Loading...</div>;
  if(error)   return <div>Error...</div>;
  if(!data)   return null;
  console.log( "data",data );

  //API 비즈니스 오류 처리 필요.


const weatherDataArr = TransData(data.response.body.items.item);
console.log( "weatherDataArr",weatherDataArr );

const headers2 = [
//  {"text": "기준일자", "value": "baseDate"},
//  {"text": "기준시각", "value": "baseTime"},
  {"text": "예보일자", "value": "fcstDate"},
  {"text": "예보시각", "value": "fcstTime"},
  {"text": "기온(℃)", "value": "T1H"},
  {"text": "습도(%)", "value": "REH"},
  {"text": "1시간 강수량", "value": "RN1"}
];

  console.log("ApiDataGoKr end");
  return (
    <div className="App">
    <h2>날씨정보</h2>
      <DataTable 
        headers={headers2} 
        items={weatherDataArr}
      />
    </div>
  )
}

//날씨 데이터 정제(변환)
function TransData(vData) {
  // 예보구분	항목값	항목명	단위
  // T1H	기온	℃
  // RN1	1시간 강수량	범주 (1 mm)
  // SKY	하늘상태	코드값
  // UUU	동서바람성분	m/s
  // VVV	남북바람성분	m/s
  // REH	습도	%
  // PTY	강수형태	코드값
  // LGT	낙뢰	kA(킬로암페어)
  // VEC	풍향	deg
  // WSD	풍속	m/s
  console.log("TransData.vData", vData);
  let weatherDataArr = [];

  // for of 반복문으로 객체 안의 배열로 접근하여, 배열 안의 객체의 key값으로 접근
  for (let i of vData) {
    //console.log("TransData.i", i);
    
    if (i.category === "T1H" || i.category === "REH" || i.category === "RN1"){
      // i는 items 배열(객체 형태)을 순서대로 하나씩 값을 가진다.
      // output 배열에 기등록된 건(일자,시각)인지 확인. 없으면 넣어준다.
      let data1 = weatherDataArr.find(item => item.baseDate === i.baseDate && item.baseTime === i.baseTime && item.fcstTime === i.fcstTime);
      if(data1 === undefined) {
        let properties = {
          "baseDate": i.baseDate,
          "baseTime": i.baseTime,
          "fcstDate": i.fcstDate,
          "fcstTime": i.fcstTime
        };
        // output 배열에 등록건에 category값을 추가로 넣어준다.
        // T1H	기온	℃    // REH	습도	%    // RN1	1시간 강수량	범주 (1 mm)
        if      (i.category === "T1H"){ properties['T1H'] = i.fcstValue;      }
        else if (i.category === "REH"){ properties['REH'] = i.fcstValue;      }
        else if (i.category === "RN1"){ properties['RN1'] = i.fcstValue;      }
        weatherDataArr.push(properties);
      
      // 기등록건이 있으므로, category값을 추가로 넣어준다.
      } else {
        //console.log("TransData.weatherDataArr data1",data1);
        if      (i.category === "T1H"){ data1['T1H'] = i.fcstValue;      }
        else if (i.category === "REH"){ data1['REH'] = i.fcstValue;      }
        else if (i.category === "RN1"){ data1['RN1'] = i.fcstValue;      }
      }
    } //end if (i.category....
    
  } //end for (let i of vData)
  //console.log("TransData.weatherDataArr",weatherDataArr);
  console.log("TransData end");
  return weatherDataArr;
} //end function TransData

// 터미널에 npm install add axios 입력하여 axios 라이브러리 설치
//출처: https://dori-coding.tistory.com/entry/React-공공데이터-API에-있는-데이터-출력하기 [도리쓰에러쓰:티스토리]

export default WeatherInfo;