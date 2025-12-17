import React,{useEffect,useState} from 'react';
import type { CascaderProps } from 'antd';
import { Cascader } from 'antd';

interface Option {
  value: number|string;
  label: string;
  children?: Option[];
}
interface FilterApiItem {
  [key: string]: any; // 由于 idKey 和 nameKey 是动态的，用索引签名表示“任意属性”
}
interface FilterApiResponse {
  data: FilterApiItem[]; // data 是包含任意属性的对象数组
  // 其他可能的字段（如 code、message 等，根据实际接口补充）
}

type Props = {
  setType?: string;
  // isRowSetAllAuto?: boolean;
  // rowSetAllText?: string;
  isApiAuto?: boolean;
  apiName?: string;
  apiParams?: any;
  apiMethods?: string;
  idKey?: string;
  nameKey?: string; 
  multiple?: boolean;
  showSearch?: boolean;
  searchValue?: string;
  selectData?: number[];
  setSelectData?: (data: number[]) => void;
  changeOnSelect?:boolean,
  expandTrigger?: 'click' | 'hover',
}
const App: React.FC<Props> = (props:Props) => {
  const {
    setType,
    isApiAuto,
    apiName,
    apiParams,
    apiMethods,
    idKey = "id",
    nameKey = "name",
    multiple,
    showSearch,
    searchValue,
    selectData,
    setSelectData,
    changeOnSelect,
    expandTrigger,
  } = props;
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true); // 新增加载状态
  useEffect(() => {
    console.log('setType',setType);
    setType && init();
  }, [setType]);
  
  const init = async () => {
    const list = await loadData();
    setOptions(list);
  };

  const loadData = async () => {
    if (isApiAuto) {
      const res = (await getFilterApi({
        apiName,
        apiParams,
        apiMethods,
        idKey,
        nameKey,
      } as {
        apiName: string;
        apiParams: any;
        apiMethods: string;
        idKey?: string;
        nameKey?: string;
      })) as FilterApiResponse;
      console.log("resres", res);
      // return res?.data||[];

      let _list = res.data || [];
      let list:Option[];
      list = _list.map((item: FilterApiItem) => ({
        value: item[idKey] as number,
        label: item[nameKey] as string,
        children : item.children ? (item.children as FilterApiItem[]).map((cItem: FilterApiItem) => ({
          value: cItem[idKey] as number,
          label: cItem[nameKey] as string,
        })) : undefined
      })); //重新赋值value label
      setLoading(false);
      // apiCache[apiName] = { code, data };
      // app.StorageH.set("FILTER_API_CACHE", apiCache);
      return list;
    } else {
      let list:Option[] = [];
      setLoading(false);
      return list;
    }
  };

  const getFilterApi = async ({
    apiParams,
    apiName,
    apiMethods,
  }: {
    apiParams: any;
    apiName: string;
    apiMethods: string;
  }) => {
    if (apiMethods == "POST") {
      const response = await fetch(apiName, {
        body: JSON.stringify(apiParams),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } else {
      const response = await fetch(`${apiName}${apiParams}`);
      const result = await response.json();
      return result;
    }
  };

  const onChange: CascaderProps<Option>['onChange'] = (value) => {
    console.log('onChange',value);
    setSelectData && setSelectData((value as number[]) || []);
  };

  return (
    <Cascader style={{ width: "100%" }} placeholder="全部" value={loading?[]:selectData} options={options} onChange={onChange} changeOnSelect={changeOnSelect} expandTrigger={expandTrigger} />
  );
}

export default App;