import {createSlice} from '@reduxjs/toolkit';
import {cookieRemove} from "@/utils/cookies-set";

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

const userSlice = createSlice({
    name: 'user',
    initialState: {
        isLogin: false,
        userInfo: {},
        isBlogger: false,
        // bloggerInfo:{},
    },
    reducers: {
        init(state, {payload}){
            if(payload){
                state.isLogin = payload?.isLogin || false; //是否登录
                state.userInfo = payload?.userInfo || {};  //用户信息
                state.isBlogger = payload?.isBlogger || false; //自己是否是博主
                // state.bloggerInfo = payload?.bloggerInfo || {}; //自己对应的博主信息
            }
        },
        setUserInfo: (state, {payload}) => {
            state.userInfo = payload;
        },
        // setBloggerInfo: (state, {payload}) => {
        //     state.bloggerInfo = payload;
        // },
        // 修改用户登录状态
        changeLoginStatus: (state, {payload}) => {
            state.isLogin = payload;
        },
        changeBloggerStatus: (state, {payload}) => {
            state.isBlogger = payload;
        },
        // 清除用户信息
        clearUserInfo: (state, {payload}) => {
            // console.log('clearUserInfo');
            cookieRemove("token");
            cookieRemove("userInfo");
            state.isLogin = false;
            state.isBlogger = false;
            state.userInfo = {}
            // state.bloggerInfo = {};
        },
    },
});

export const {setUserInfo, changeLoginStatus, changeBloggerStatus, clearUserInfo} = userSlice.actions;
export default userSlice.reducer;

