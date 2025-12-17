import React, { useEffect, useRef, useState } from "react";
import { Button, Divider, Input, Select, Space } from "antd";
import type { InputRef } from "antd";

const DefaultFilterData = {
  articles: {
    list: [],
  },
  lifestyles: {
    list: [],
  },
  publish: {
    list: [
      { value: 0, label: "全部" },
      { value: 1, label: "已发布" },
      { value: 0, label: "未发布" },
    ],
  },
};
type DefaultFilterKeys = keyof typeof DefaultFilterData;
type Props = {
  filterType?: DefaultFilterKeys;
  isRowSetAllAuto?: boolean;
  rowSetAllText?: string;
  isApiAuto?: boolean;
  apiName?: string;
  apiParams?: any;
  apiMethods?: string;
  // apiParams?: Record<string, any>,
  idKey?: string;
  nameKey?: string;
  selectData?: number[] | number;
  setSelectData?: (data: (number[] | number)) => void;
  mode?: "multiple" | "tags" | undefined;
  optionFilterProp?: string;
  extraClass?: string;
};
interface FilterApiItem {
  [key: string]: any; // 由于 idKey 和 nameKey 是动态的，用索引签名表示“任意属性”
}
interface FilterApiResponse {
  data: FilterApiItem[]; // data 是包含任意属性的对象数组
  // 其他可能的字段（如 code、message 等，根据实际接口补充）
}
interface option {
  label: string
  value: number
}
const App: React.FC<Props> = (props: Props) => {
  const {
    filterType,
    isRowSetAllAuto,
    rowSetAllText,
    selectData,
    setSelectData,
    isApiAuto,
    apiName,
    apiParams,
    apiMethods,
    idKey = "id",
    nameKey = "name",
    mode,
    optionFilterProp = "label",
    extraClass = "w-full",
  } = props;
  const [items, setItems] = useState<option[]>([]);
  const [name, setName] = useState("");
  const inputRef = useRef<InputRef>(null);
  const [loading, setLoading] = useState(true); // 新增加载状态

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  useEffect(() => {
    filterType && init();
  }, [filterType]);
  
  const init = async () => {
    const list = await loadData();
    setItems(list);
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
      let list:option[];
      list = _list.map((item: FilterApiItem) => ({
        value: item[idKey || "id"] as number,
        label: item[nameKey || "name"] as string,
      })); //重新赋值value label
      isRowSetAllAuto &&
        list.unshift({ value: 0, label: rowSetAllText || "全部" }); //增加"全部"
      // isRowSetAllAuto && selectData&&selectData.length<=0 && setSelectData && setSelectData([0]);
      setLoading(false);
      // apiCache[apiName] = { code, data };
      // app.StorageH.set("FILTER_API_CACHE", apiCache);
      return list;
    } else {
      let list:option[] = [];
      list = DefaultFilterData?.[filterType as DefaultFilterKeys]?.list || [];
      // isRowSetAllAuto && selectData&&selectData.length<=0 && setSelectData && setSelectData([0]);
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

  const addItem = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    e.preventDefault();
    if (!name) return;
    setItems([...items, { label: name, value: items.length }]);
    setName("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const onChange = (value: any, option: any) => {
    console.log("onChange", value, option);
    if (mode == "multiple") {
      if (value[value.length - 1] == 0) {
        value = [0];
      } else {
        value = value.filter((v: number) => v !== 0);
      }
    } else {
      value = value;
    }
    setSelectData && setSelectData(value);
  };

  return (
    <Select
      className={extraClass}
      placeholder="选择分组"
      onChange={onChange}
      loading={loading}
      value={loading ? [] : selectData}
      mode={mode}
      optionFilterProp={optionFilterProp}
      popupRender={(menu) => (
        <>
          {menu}
          {/* <Divider style={{ margin: '8px 0' }} />
          <Space style={{ padding: '0 8px 4px' }}>
            <Input
              placeholder="新增分组"
              ref={inputRef}
              value={name}
              onChange={onNameChange}
              onKeyDown={(e) => e.stopPropagation()}
            />
            <Button type="text" onClick={addItem}>
              Add+
            </Button>
          </Space> */}
        </>
      )}
      options={items.map((item) => ({ label: item.label, value: item.value }))}
    />
  );
};

export default App;
