export interface BloggerInfo {
  user_name?: string;
  introduce1?: string;
  introduce2?: string;
  motto1?: string;
  motto2?: string;
  avatar_url?: string;
}

// 文章
export interface ArticlesInfo {
  id?: number;
  title?: string;
  excerpt?: string;
  content?: string;
  delta_data?: string;
  published?: boolean;
  sort?: number;
  user_id?: number;
  blogger_id?: number;
  created_at?: string;
  updated_at?: string;
  article_groups_relation?: article_groups_relation[]
}

export interface article_groups_relation {
  group_id: number,
  article_id:number,
  article_groups?: article_groups
}

export interface article_groups {
  id: number
  name: string
  description?:string,
  userId:string  
}

// 生活手记
export interface LifeStylesInfo {
  id?: number;
  title?: string;
  excerpt?: string
  cover_img?: string
  published: boolean
  sort:number
  user_id?: number;
  created_at?: string;
  updated_at?: string;
  photos?: life_styles_photos[]
  labelIds?: (life_styles_label|life_styles_sub_label)[]
}


export interface life_styles_label {
  id: number
  name: string
  sort:number
}

export interface life_styles_sub_label {
  id: number
  name: string
  sort:number
}

export interface life_styles_photos {
  id: number
  life_styles_id:number
  url: string
  excerpt?: string
  sort:number
  user_id: string
  created_at: string
}
// export interface life_styles_to_label {
//   label_id: number;
// }

// export interface life_styles_to_sub_label {
//   sub_label_id: number;
// }

// 请求
export interface ResData<T> {
  code?: number;
  data?: T;
  msg?: string;
}

export enum ApiCode {
  SUCCESS = 1,
  FAIL = -1,
}

export enum ApiMsg {
  SUCCESS = "success",
  FAIL = "fail",
}

const FAILRES = {
  OBJECT: {
    code: ApiCode.FAIL,
    data: {},
    msg: ApiMsg.FAIL,
  },
  ARRAY: {
    code: ApiCode.FAIL,
    data: [],
    msg: ApiMsg.FAIL,
  },
  NULL: {
    code: ApiCode.FAIL,
    data: null,
    msg: ApiMsg.FAIL,
  },
};

const SUCCESSRES = {
  OBJECT: {
    code: ApiCode.SUCCESS,
    data: {},
    msg: ApiMsg.SUCCESS,
  },
  ARRAY: {
    code: ApiCode.SUCCESS,
    data: [],
    msg: ApiMsg.SUCCESS,
  },
  NULL: {
    code: ApiCode.SUCCESS,
    data: null,
    msg: ApiMsg.SUCCESS,
  },
};

export { FAILRES, SUCCESSRES };
