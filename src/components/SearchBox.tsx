import React, { ChangeEvent, FormEvent } from 'react'
import {
  SearchOutlined 
} from '@ant-design/icons';
import { Input,Button } from 'antd';
interface SelectItem {
  key: string|number,
  name: string
}
type Props = {
  searchText?:string,
  // setSearchText?:(e: ChangeEvent<HTMLInputElement>) => void,
  setSearchText?: (e: string) => void,
  selectList?:Array<SelectItem>,
  onSearch?: (value: string) => void;
}

const SearchBox = (props: Props) => {
  const {selectList=[],searchText="",setSearchText = () => {},onSearch = () => {},} = props;
  return (
    <div className='search-box border-1 border-gray-200 rounded flex items-center'>
      <div className='search-type-box'>
        {selectList.length===0 ? <div className='pl-2'><SearchOutlined></SearchOutlined></div> : selectList.map(item => (
          <div key={item.key} className='search-type-item'>
            {item.name}
          </div>
        ))}
      </div>
      <Input value={searchText} onChange={e=>setSearchText(e.target.value)} onPressEnter={()=>onSearch(searchText)} className='search-input flex-1' placeholder='请输入关键词' variant="borderless" />
      <Button variant="text" color='primary' size='small' onClick={()=>onSearch(searchText)}>搜索</Button>
    </div>
  )
}

export default SearchBox;