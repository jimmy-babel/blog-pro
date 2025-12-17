import React, { useState, useMemo, useEffect } from "react";
import moment, { Moment } from "moment";
import OriPop from "@/components/ori-cmpts/ori-pop/OriPop";
import { Button,message} from "antd";
import { EditOutlined } from "@ant-design/icons";
import {useCheckUser} from "@/lib/use-helper/base-mixin";
type Props = {};

// 心情类型定义
type MoodType = {
  emoji: string;
  key?: string;
  note?: string;
};

// 心情记录类型定义
type MoodRecordType = {
  id?: number;
  date?: string; // YYYY-MM-DD 格式
  emoji?: string;
  emoji_key?: string;
  note?: string;
};

// 预定义心情列表
const MOODS: MoodType[] = [
  //emoji列表
  { emoji: "😶", key: "calm", note: "平平淡淡" },
  { emoji: "☺️", key: "happy", note: "开心" },
  { emoji: "🥺", key: "sad", note: "难过" },
  { emoji: "😑", key: "speechless", note: "无语" },
  { emoji: "😡", key: "angry", note: "生气" },
  { emoji: "😷", key: "fallin", note: "生病" },
  { emoji: "🏃‍♀️", key: "run", note: "运动" },
  { emoji: "✍️", key: "strive", note: "自律" },
];

// 示例心情记录数据
const sampleMoodRecords: MoodRecordType[] = [
  //模拟数据
  {
    id: 1,
    date: "2025-12-01",
    emoji: "☺️",
    emoji_key: "happy",
    note: "第一天是☺️",
  },
  {
    id: 2,
    date: "2025-12-03",
    emoji: "🥺",
    emoji_key: "sad",
    note: "第三天是🥺",
  },
  {
    id: 3,
    date: "2025-12-04",
    emoji: "😑",
    emoji_key: "speechless",
    note: "第四天是😑",
  },
  {
    id: 4,
    date: "2025-12-05",
    emoji: "😡",
    emoji_key: "angry",
    note: "第五天是😡",
  },
  {
    id: 5,
    date: "2025-12-07",
    emoji: "😷",
    emoji_key: "fallin",
    note: "第七天是😷",
  },
  {
    id: 6,
    date: "2025-12-08",
    emoji: "🏃‍♀️",
    emoji_key: "run",
    note: "第八天是🏃‍♀️",
  },
  {
    id: 7,
    date: "2025-12-09",
    emoji: "✍️",
    emoji_key: "strive",
    note: "第九天是✍️",
  },
  {
    id: 8,
    date: "2025-12-10",
    emoji: "😶",
    emoji_key: "calm",
    note: "第十天是😶",
  },
];

const MoodRecord = (props: Props) => {
  let curMonth = moment().format("YYYY-MM");
  const [currentDate, setCurrentDate] = useState<Moment>(moment(curMonth));
  const [moodRecords, setMoodRecords] = useState<MoodRecordType[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(moment().format("YYYY-MM-DD"));
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [curDayData, setCurDayData] = useState<any>({});
  const [moodData, setMoodData] = useState<MoodRecordType>({});
  const {checkUser} = useCheckUser();
  const [isBlogger,setIsBlogger] = useState(false);
  const [isLoading,setIsLoading] = useState(false);
  console.log("currentDate", currentDate);
  console.log("selectedDate", selectedDate);

  // 生成日历数据
  const calendarData = useMemo(() => {
    const year = currentDate.year();
    const month = currentDate.month();

    // 获取当月第一天是星期几（0-6，0是周日）
    const firstDayOfMonth = moment([year, month, 1]).day();
    // 获取当月有多少天
    const daysInMonth = currentDate.daysInMonth();
    //跨年的处理，上个月是11月
    const prevMonth = month === 0 ? 11 : month - 1;
    // 获取上月有多少天
    const daysInPrevMonth = moment([year, prevMonth, 1]).daysInMonth(); //获取上月有多少天
    const calendar = []; // 存储日历数据的数组
    console.log(
      "日历显示跨月份天数：",
      firstDayOfMonth,
      daysInMonth,
      42 - daysInMonth - firstDayOfMonth
    );
    // 添加上月的日期
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const date = daysInPrevMonth - i;
      calendar.push({
        date,
        month: "prev",
        fullDate: moment([year, prevMonth, date]).format("YYYY-MM-DD"),
      });
    }

    // 添加当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = i;
      calendar.push({
        date,
        month: "current",
        fullDate: moment([year, month, date]).format("YYYY-MM-DD"),
      });
    }

    // 添加下月的日期，补满6行
    const remainingDays = 42 - calendar.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = i;
      calendar.push({
        date,
        month: "next",
        fullDate: moment([year, month + 1, date]).format("YYYY-MM-DD"),
      });
    }
    console.log("日历数据calendar", calendar);
    return calendar;
  }, [currentDate]);

  useEffect(() => {
    checkUser().then((res:any) => {
      if(res?.data?.isBlogger){
        setIsBlogger(true);
        getMoodRecords().then((records) => setMoodRecords(records))
        // setMoodRecords(sampleMoodRecords);
      }
    });
  }, []);

  // 获取某天的心情记录
  const getMoodForDate = (date: string): MoodRecordType | null => {
    const record = moodRecords.find((record) => record.date === date);
    return record || null;
  };

  // 处理日期点击
  const handleDateClick = (
    date: string,
    isCurrentMonth: boolean,
    item: any
  ) => {
    const today = moment().format("YYYY-MM-DD");
    if (!isCurrentMonth || date > today) return;

    setSelectedDate(date);
    let moodRecord = getMoodForDate(date) || {}; //从记录中找到该日期的数据
    setMoodData(moodRecord);
    (!moodRecord?.id || item?.isEdit) && setShowMoodPicker(!showMoodPicker); //未记录|编辑时
    setCurDayData(item);
  };

  // 处理心情选择
  const handleMoodSelect = (mood: MoodType) => {
    if (!selectedDate) return;
    let lastNoteIsPrepare =
      !moodData.note ||
      MOODS.some((item) => item.note == moodData.note?.trim());
    setMoodData({
      ...moodData,
      emoji: mood.emoji,
      emoji_key: mood.key,
      note: lastNoteIsPrepare ? mood.note : (moodData.note || "").trim(),
    });
    // // 检查是否已有该日期的记录
    // const existingIndex = moodRecords.findIndex(record => record.date === selectedDate);

    // let newRecords;
    // if (existingIndex >= 0) {
    //   // 更新现有记录
    //   newRecords = [...moodRecords];
    //   newRecords[existingIndex] = { ...newRecords[existingIndex], emoji: mood.emoji, note: mood.note };
    // } else {
    //   // 添加新记录
    //   newRecords = [...moodRecords, { date: selectedDate, emoji: mood.emoji, note: mood.note }];
    // }

    // setMoodRecords(newRecords);
    // setShowMoodPicker(false);
  };
  const validateMoodData = () => {
    let error = "";
    if (!moodData.emoji || !moodData.emoji_key) {
      error = '请选择心情';
    }
    if(error){
      message.error(error);
    }
    return !!!error;
  }
  const commitMoodRecord = async () => {
    let valid = validateMoodData();
    if (!valid) return
    if (!selectedDate||isLoading) return;
    let params = {
      ...moodData,
      date: selectedDate,
      blogger: window.__NEXT_ACCOUNT__,
    };
    console.log('params',params);
    setIsLoading(true);
    setMoodRecordsApi(params).then((res) => {
      if(res>0){
        // setMoodRecords([...moodRecords, params]);
        if(params?.id){
          setCurDayData({...curDayData,...params});
        }
        getMoodRecords().then((records) => setMoodRecords(records))
        setShowMoodPicker(false);
      }else{
        console.log('提交失败');
      }
      setIsLoading(false);
    });
  };

  // 切换到上个月
  const prevMonth = () => {
    setCurrentDate(currentDate.clone().subtract(1, "month"));
    setShowMoodPicker(false);
  };

  // 切换到下个月
  const nextMonth = () => {
    setCurrentDate(currentDate.clone().add(1, "month"));
    setShowMoodPicker(false);
  };

  // 星期几的标签
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  async function getMoodRecords() {
    const response = await fetch(
      `/api/blog/get-mood-records?blogger=${window.__NEXT_ACCOUNT__}`
    );
    const result = await response.json();
    return result?.data||[];
  }

  async function setMoodRecordsApi(params: MoodRecordType) {
    try{
      const response = await fetch(
        `/api/blog/mood-records-edit`,
        {
          body: JSON.stringify(params),
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      return result?.data||0;
    }catch (error) {
      console.error('提交心情记录失败:', error);
      return 0;
    }
  }

  return (
    <>
      {isBlogger && (
        <div className="w-full p-4 flex items-start gap-10">
          {/* <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">心情记录日历</h2>
            <p className="text-gray-500">点击日期选择心情</p>
          </div> */}

          <div className="calendar min-w-[448px]">
            {/* 日历头部 */}
            <div className="flex justify-between items-center mb-4 bg-gray-800 text-white p-3 rounded-lg">
              <button
                onClick={prevMonth}
                className="text-xl hover:bg-gray-700 cursor-pointer p-2 rounded-full transition-colors"
              >
                &lt;
              </button>
              <h3 className="text-xl font-semibold">
                {currentDate.format("YYYY年MM月")}
              </h3>
              <button
                onClick={nextMonth}
                className="text-xl hover:bg-gray-700 cursor-pointer p-2 rounded-full transition-colors"
              >
                &gt;
              </button>
            </div>

            {/* 星期几标签 */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-600"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 日历网格 */}
            <div className="grid grid-cols-7 gap-2">
              {calendarData.map((day, index) => {
                const mood = getMoodForDate(day.fullDate);
                const isSelected = selectedDate === day.fullDate;
                const isCurrentMonth = day.month === "current";
                const today = moment().format("YYYY-MM-DD");
                const isFutureDate = day.fullDate > today;
                const isClickable = isCurrentMonth && !isFutureDate;

                return (
                  <div
                    key={index}
                    onClick={() =>
                      handleDateClick(day.fullDate, isCurrentMonth, mood)
                    }
                    className={`
                        aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-200
                        ${isCurrentMonth
                          ? "bg-gray-800 text-white hover:bg-gray-700"
                          : "bg-gray-100 text-gray-400 cursor-default"
                        }
                        ${isClickable ? "cursor-pointer" : ""}
                        ${isSelected ? "ring-2 ring-yellow-400 scale-105" : ""}
                      `}
                  >
                    <div className="text-sm">{day.date}</div>
                    {mood && <div className="text-2xl">{mood.emoji}</div>}
                    {/* 显示红点标记 */}
                    {isClickable && !mood && (
                      <div className="w-1 h-1 bg-red-500 rounded-full mt-1"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 显示选中日期的数据 */}
          {curDayData?.date && (
            <div className="recored-item bg-gray-800 rounded-3xl pl-4 pr-4 pt-4 pb-8 text-white flex-1 relative max-w-[448px]">
              <div className="text-2xl mb-3 text-center">
                {moment(curDayData?.date).format("YYYY-MM-DD")}{" "}
                {curDayData?.emoji || ""}
              </div>
              <div className="text-md">{curDayData?.note || ""}</div>
              <EditOutlined
                className="absolute top-5.5 right-7 text-white text-xl cursor-pointer"
                onClick={() =>
                  handleDateClick(curDayData?.date, true, {
                    ...curDayData,
                    isEdit: true,
                  })
                }
              />
            </div>
          )}
        </div>
      )}
      <OriPop
        placement="center"
        visible={showMoodPicker}
        onVisibleChange={setShowMoodPicker}
        onClose={() => setShowMoodPicker(false)}
      >
        {/* 心情选择器 */}
        {
          // <div className="bg-white text-gray-800 rounded-lg shadow-lg p-4">
          <div className=" rounded-lg shadow-lg p-4">
            <h4 className="text-lg font-semibold mb-3">
              {moment(selectedDate).format("YYYY-MM-DD")} 的心情
            </h4>
            <div className="grid grid-cols-4 gap-3">
              {MOODS.map((mood, index) => (
                <button
                  key={index}
                  onClick={() => handleMoodSelect(mood)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition-colors border-2 cursor-pointer ${
                    moodData?.emoji_key == mood.key
                      ? "border-yellow-400"
                      : "border-transparent"
                  }`}
                >
                  <div className="text-3xl mb-1">{mood.emoji}</div>
                  <div className="text-sm">{mood.note}</div>
                </button>
              ))}
            </div>
            <div className="p-1 mt-4">
              <textarea
                id="excerpt"
                value={moodData?.note || ""}
                onChange={(e) =>
                  setMoodData({
                    ...moodData,
                    note: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 rounded-md"
                placeholder="随手写写.."
              />
            </div>
            <div className="flex items-center gap-4 pl-4 pr-4 mt-4">
              <Button
                onClick={() => setShowMoodPicker(false)}
                className="w-full leading-20"
                size="large"
              >
                取消
              </Button>
              <Button
                onClick={() => commitMoodRecord()}
                color="default"
                variant="solid"
                className="w-full leading-20"
                size="large"
              >
                确认
              </Button>
            </div>
          </div>
        }
      </OriPop>
    </>
  );
};
export default MoodRecord;
