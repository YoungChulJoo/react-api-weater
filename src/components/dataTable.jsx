import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import {Table, TableHead, TableBody, TableRow, TableCell} from '@mui/material';

function DataTable(
  { headers,
    items = [], // items props 받기, default parameter 빈 배열로 설정
  }) {

  // headers가 있는지 체크하고, 없다면 에러를 던짐
  if (!headers || !headers.length) {
    throw new Error('<DataTable /> headers is required.')
  }
  // value 순서에 맞게 테이블 데이터를 출력하기 위한 배열
  const headerKey = headers.map((header) => header.value);

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}></Box>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
          {
            headers.map((header) => 
              <TableCell key={header.text}>
                {header.text} {/* 컬럼명 바인딩 */}
              </TableCell> 
            )
          }
        </TableRow>
      </TableHead>
      <TableBody>
        {
          items.map((item, index) => (
            <TableRow key={index}>
              {/* headerKey를 순회하면서 key를 가져옴 */}
              { 
                headerKey.map((key) => 
                  <TableCell key={key + index}>
                    {item[key]} {/* key로 객체의 값을 출력 */}
                  </TableCell>
                )
              }
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
    </Card>
  )
}

//출처 : https://velog.io/@seo__namu/React-Data-Table-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8-%EB%A7%8C%EB%93%A4%EA%B8%B0

// [React/MUI] MUI 설치
// 터미널에서 npm 일 경우,  yarn일 경우 해당되는 명령어로 설치한다. 
// npm install @mui/material @emotion/react @emotion/styled
// yarn add @mui/material @emotion/react @emotion/styled
// 기본적으로 emotion을 스타일 엔진으로 사용하지만,
// emotion 대신 styled-components을 스타일 엔진으로 사용할 수 있다.
// styled-components는 다음 명령어로 설치하면 된다. 
// npm install @mui/material @mui/styled-engine-sc styled-components
// yarn add @mui/material @mui/styled-engine-sc styled-components
// 출처 : https://fubabaz.tistory.com/39

export default DataTable;