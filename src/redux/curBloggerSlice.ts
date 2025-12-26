import {createSlice} from '@reduxjs/toolkit';
import {cookieSet} from "@/utils/cookies-set";

// export const updateUserInfoAsync = createAsyncThunk(
//   "user/updateUserInfoAsync",
//   async (payload, thunkApi) => {
//     await editUser(payload.userId, payload.newInfo);
//     thunkApi.dispatch(updateUserInfo(payload.newInfo));
//   }
// );

// export type User = {
//     isLogin: boolean;
//     userInfo: UserInfo
// }
// export type UserInfo = {
//     id?: string;
//     nickname?: string;
//     email?: string;
//     avatar: string | null;
//     createdAt?: string;
//     oauthProvider: string | null;
// };

const curBloggerSlice = createSlice({
    name: 'curBlogger',
    initialState: {
        curBloggerInfo: {},
        // bloggerInfo:{},
    },
    reducers: {
        init(state, {payload}){
            if(payload){
                state.curBloggerInfo = payload?.curBloggerInfo || {}; //用户信息
                cookieSet('curBloggerInfo',payload);
            }
        },
        setCurBloggerInfo: (state, {payload}) => {
            state.curBloggerInfo = payload;
            cookieSet('curBloggerInfo',payload);
        },
    },
});

export const {init,setCurBloggerInfo} = curBloggerSlice.actions;
export default curBloggerSlice.reducer;

