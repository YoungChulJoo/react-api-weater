import '../App.css';
import { useState, useEffect } from 'react';
import {TextField, Button, Box, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import DataTable from "./dataTable";
import SimpleLineChart from './simpleLineChart';

export default function WeatherInfo() {
  const [clearSearch, setClearSearch] = useState(false);  //조회여부

  //- 조회조건 -----------------------------------------------------
  const [posData, setPosData] = useState(
    [
        { "pos": '서울', "nx": '60', "ny": '127' },
        { "pos": '대전', "nx": '67', "ny": '10' },
        { "pos": '대구', "nx": '89', "ny": '90' },
        { "pos": '부산', "nx": '98', "ny": '76' },
        { "pos": '제주', "nx": '53', "ny": '38' },
        { "pos": '독도', "nx": '144', "ny": '123' }
    ]
  );

  let today = new Date(); // 현재 날짜를 가져옵니다.
  let formattedDate = today.getFullYear()
                    + ('0'+(today.getMonth()+1)).slice(-2)
                    + ('0'+today.getDate()).slice(-2);// 원하는 형식(YYYYMMDD)으로 날짜를 설정합니다.
  let formattedHours = String(today.getHours()-1).padStart(2, "0")+"00";

  const [posId, setPosId] = useState('0');

  // 지역 Select 변경시 : x/y좌표 변경
  const selectChange = (e) => {
    e.preventDefault();
    document.getElementById('nx').value = posData[e.target.value].nx;
    document.getElementById('ny').value = posData[e.target.value].ny;
    setPosId(e.target.value);
  }
  //------------------------------------------------------

  const [reqData, setReqData] = useState(null);
 
  // 조회버튼 클릭시
  const searchBtn = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setReqData( {
        "baseDate": data.get('baseDate'),
        "baseTime": data.get('baseTime'),
        "nx": data.get('nx'),
        "ny": data.get('ny')
      } );
      setClearSearch(!clearSearch);
  }

  //- API호출 -----------------------------------------------------
  const URL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst";
  const [resData, setResData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  let gridContents = null;

  const fetchData = async () => {
    if(reqData === null) return;
    try {
      setError(null);
      setResData(null);
      setLoading(true);
      //console.log( process.env.REACT_APP_API_KEY );
      //console.log( "reqData", reqData );
      
      const response = await axios.get(URL, {
          params: {
            serviceKey: process.env.REACT_APP_API_KEY,
            numOfRows: 0,
            pageNo: 1,
            base_date: reqData.baseDate,
            base_time: reqData.baseTime,
            nx: reqData.nx,
            ny: reqData.ny,
            dataType: "JSON"
          }
      });
      setResData(response.data);

      //console.log( "response",response );

      //API 비즈니스 오류 처리 필요.
      //status=200이지만 response결과는 json형태가 아닌 형태로 오류를 주는 경우가 있음. (예: Router 오류일 경우 )
      // header에서 RegExp로 json형태인지 판단하고 아닌경우 그대로 메세지를 화면에 셋팅.
      if( response.headers['content-type'].search(/json/) === -1 ) {
        throw new Error(response.data);
      }

    } catch(e) {
      setError(e);
    }
    setLoading(false);
  };

  useEffect(() => {
      fetchData();
  }, [clearSearch]);

  if(loading) {
    gridContents = <><div>Loading...</div></>;
  }
  else if(error) {
    gridContents = <div>{error.message}</div>;
  }
  else if(!resData) {
    gridContents = null;
  } else {
    //console.log( "resData",resData );
    //console.log( "resData..resultCode",resData.response.header.resultCode );
    if(resData.response.header.resultCode !== "00") {
      gridContents = <div>{resData.response.header.resultMsg}</div>;
    } else {
      const weatherDataArr = TransData(resData.response.body.items.item);
      //console.log( "weatherDataArr",weatherDataArr );

      const gridHdr = [
        //  {"text": "기준일자", "value": "baseDate"},
        //  {"text": "기준시각", "value": "baseTime"},
        {"text": "예보일자", "value": "fcstDate"},
        {"text": "예보시각", "value": "fcstTime"},
        {"text": "기온(℃)", "value": "T1H"},
        {"text": "습도(%)", "value": "REH"},
        {"text": "하늘상태", "value": "SKY2"},
        {"text": "1시간 강수량", "value": "RN1"}
        ];
        gridContents = <>
        <DataTable 
        headers={gridHdr} 
        items={weatherDataArr}
      />
      <SimpleLineChart data={weatherDataArr} />
      </>;
            
    }
  }

  //- 화면 출력-----------------------------------------------------
  let contents = <>
    <div>
      <h1>기상청 Open API(초단기예보)</h1>
    <Box component="form" onSubmit={searchBtn} noValidate sx={{ mt: 1 }}>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        label="지역"
        value={posId}
        sx={{ m: 1, minWidth: 120 }}
        onChange={selectChange}
      >
        {
          posData.map((item, index) => (
            <MenuItem value={index} key={index}>{item.pos}</MenuItem>
            ))
        }
      </Select>
      <TextField margin="normal" id="nx" label="X좌표" name="nx" defaultValue={posData[posId].nx} />
      <TextField margin="normal" id="ny" label="Y좌표" name="ny" defaultValue={posData[posId].ny} />
      <TextField margin="normal" id="baseDate" label="예보일자" name="baseDate" defaultValue={formattedDate} autoFocus />
      <TextField margin="normal" id="baseTime" label="기준시간" name="baseTime" defaultValue={formattedHours} />
    
      <Button margin="normal"  type="submit" variant="contained">조회</Button>
    </Box>
    <div>{gridContents}</div>
    </div>
  </>;
  return (
    <div>{contents}</div>
  );
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
  //console.log("TransData.vData", vData);
  let weatherDataArr = [];
  //let pyt_code = {0 : '강수 없음', 1 : '비', 2 : '비/눈', 3 : '눈', 5 : '빗방울', 6 : '진눈깨비', 7 : '눈날림'};
  let sky_code = {1 : '맑음', 3 : '구름많음', 4 : '흐림'};

  // for of 반복문으로 객체 안의 배열로 접근하여, 배열 안의 객체의 key값으로 접근
  for (let i of vData) {
    //console.log("TransData.i", i);
    
    if (i.category === "T1H" || i.category === "REH" || i.category === "RN1" || i.category === "SKY"){
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
        else if (i.category === "SKY"){ properties['SKY'] = i.fcstValue; properties['SKY2'] = sky_code[Number(i.fcstValue)];
      }
      weatherDataArr.push(properties);
      
      // 기등록건이 있으므로, category값을 추가로 넣어준다.
      } else {
        //console.log("TransData.weatherDataArr data1",data1);
        if      (i.category === "T1H"){ data1['T1H'] = i.fcstValue;      }
        else if (i.category === "REH"){ data1['REH'] = i.fcstValue;      }
        else if (i.category === "RN1"){ data1['RN1'] = i.fcstValue;      }
        else if (i.category === "SKY"){ data1['SKY'] = i.fcstValue;  data1['SKY2'] = sky_code[Number(i.fcstValue)];    }
      }
    } //end if (i.category....
    
  } //end for (let i of vData)
  //console.log("TransData.weatherDataArr",weatherDataArr);
  //console.log("TransData end");
  return weatherDataArr;
} //end function TransData

// 터미널에 npm install add axios 입력하여 axios 라이브러리 설치
//출처: https://dori-coding.tistory.com/entry/React-공공데이터-API에-있는-데이터-출력하기 [도리쓰에러쓰:티스토리]
