import {createSlice} from '@reduxjs/toolkit';
import {cookieRemove} from "@/utils/cookies-set";

// export const updateUserInfoAsync = createAsyncThunk(
//   "user/updateUserInfoAsync",
//   async (payload, thunkApi) => {
//     await editUser(payload.userId, payload.newInfo);
//     thunkApi.dispatch(updateUserInfo(payload.newInfo));
//   }
// );

export type User = {
    isLogin: boolean;
    userInfo: UserInfo
}
export type UserInfo = {
    id?: string;
    nickname?: string;
    email?: string;
    avatar: string | null;
    createdAt?: string;
    oauthProvider: string | null;
};

const userSlice = createSlice({
    name: 'user',
    initialState: {
        isLogin: false,
        userInfo: {},
        isBlogger: false,
        bloggerInfo:{},
    },
    reducers: {
        init(state, {payload}){
            if(payload){
                state.isLogin = payload?.isLogin || false;
                state.userInfo = payload?.userInfo || {};
                state.isBlogger = payload?.isBlogger || false;
                state.bloggerInfo = payload?.bloggerInfo || {};
            }
        },
        setUserInfo: (state, {payload}) => {
            state.userInfo = payload;
        },
        setBloggerInfo: (state, {payload}) => {
            state.bloggerInfo = payload;
        },
        // 修改用户登录状态
        changeLoginStatus: (state, {payload}) => {
            state.isLogin = payload;
        },
        changeBloggerStatus: (state, {payload}) => {
            state.isBlogger = payload;
        },
        // 清除用户信息
        clearUserInfo: (state, {payload}) => {
            console.log('clearUserInfo' + payload);
            cookieRemove("token");
            cookieRemove("userInfo");
            state.isLogin = false;
            state.isBlogger = false;
            state.userInfo = {}
            state.bloggerInfo = {};
        },
    },
});

export const {setUserInfo, changeLoginStatus, changeBloggerStatus, clearUserInfo} = userSlice.actions;
export default userSlice.reducer;

