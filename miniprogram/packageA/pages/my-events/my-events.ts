import { eventImages, avatarImaes } from "./my-events.config";
import { ActivityMpListVo, PageInfoActivityMpListVo } from "../../../utils/api";
import { loadActivityList, loadMyActivityList } from "../../../utils/activityHelper";

// 定义活动状态类型
type applyStatus = {
  statusTagText: string;
  statusClass: string;
};

// 定义活动状态类型
type ActivityStatus = {
  statusText: string;
  status: string;
};

// 定义Tab数据类型接口
interface TabDataType {
  [key: number]: {
    activityList: ActivityMpListVo[];
    loading: boolean;
    pageNum: number;
    pageSize: number;
    hasMore: boolean;
  };
}


// 根据报名时间确定报名状态
function getApplyStatus(applyStartTime: string, applyEndTime: string): applyStatus {
  const now = new Date();
  const startTime = new Date(applyStartTime);
  const endTime = new Date(applyEndTime);
  
  if (now < startTime) {
    // 未到报名时间
    return {
      statusTagText: '敬请期待',
      statusClass: 'upcoming' // 对应 #FFAB00
    };
  } else if (now > endTime) {
    // 报名已结束
    return {
      statusTagText: '报名已结束',
      statusClass: 'ended' // 对应 #8A8A8A
    };
  } else {
    // 报名中
    return {
      statusTagText: '报名中',
      statusClass: 'signing' // 对应 #5cc696
    };
  }
}

// 根据活动时间、报名时间和报名状态确定活动状态
function getActivityStatus(activityStartTime: string, activityEndTime: string, applyStartTime: string, applyEndTime: string, isRegistered: boolean): ActivityStatus {
  const now = new Date();
  const activityStartDate = new Date(activityStartTime);
  const activityEndDate = new Date(activityEndTime);
  const applyStartDate = new Date(applyStartTime);
  const applyEndDate = new Date(applyEndTime);
  
  if (now > activityEndDate) {
    // 活动已结束
    return {
      statusText: '已结束',
      status: 'ended'
    };
  } else if (now > applyEndDate) {
    // 报名时间已结束，不显示任何信息
    return {
      statusText: '',
      status: ''
    };
  } else if (now < applyStartDate) {
    // 报名时间未开始，不显示任何信息
    return {
      statusText: '',
      status: ''
    };
  } else if (isRegistered) {
    // 已报名
    return {
      statusText: '已报名',
      status: 'registered'
    };
  } else {
    // 可以上车
    return {
      statusText: '上车',
      status: 'sign'
    };
  }
}

// 将日期格式化为 "周X mm:dd" 格式
function formatDateToWeekDay(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekDay = weekDays[date.getDay()];
  const month = date.getMonth() + 1; // 月份从0开始
  const day = date.getDate();
  
  // 格式化为 "周X mm:dd"
  return `周${weekDay} ${month.toString().padStart(2, '0')}:${day.toString().padStart(2, '0')}`;
}

// 格式化时间为 "HH:MM" 格式
function formatTime(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

Page({
  data: {
    config: {
      tab: 1,
    },
    eventImages,
    avatarImaes,
    // 为每个tab维护独立的活动列表和分页状态
    tabData: {
      1: {
        activityList: [] as ActivityMpListVo[],
        loading: false,
        pageNum: 1,
        pageSize: 10,
        hasMore: true,
      },
      2: {
        activityList: [] as ActivityMpListVo[],
        loading: false,
        pageNum: 1,
        pageSize: 10,
        hasMore: true,
      }
    } as TabDataType,
  },


  onLoad() {
    this.fetchActivityList()
  },

  // 加载活动列表 - 使用公共函数
  async fetchActivityList(isLoadMore = false) {
    try {
      const currentTab = this.data.config.tab as number;
      const tabData = this.data.tabData[currentTab];

      // 如果是加载更多且没有更多数据，则直接返回 
      if (isLoadMore && !tabData.hasMore) return;

      // 如果是加载更多，保持loading为false，否则设置为true
      if (!isLoadMore) {
        this.setData({ [`tabData.${currentTab}.loading`]: true });
      }
      
      // 根据当前 tab 确定 activitystatus 参数
      // tab 1: 可报名 (activitystatus = 1)
      // tab 2: 已结束 (activitystatus = 2)
      // const activitystatus = currentTab;
      
      const result = await loadMyActivityList({
        showLoading: !isLoadMore, // 加载更多时不显示loading
        loadingTitle: '加载中...',
        pageNum: isLoadMore ? tabData.pageNum + 1 : 1,
        pageSize: tabData.pageSize
      });
      
      if (result?.success && result?.data && Array.isArray(result?.data?.list)) {
        // 判断是否还有更多数据
        const hasMore = result?.data?.list.length === tabData.pageSize;

        // 格式化新数据
        const newData = result?.data?.list.map(item => {
          // 格式化活动开始时间为 "周X mm:dd city address" 格式
          const formattedDate = formatDateToWeekDay(item?.activityStartTime);
          const formattedTime = formatTime(item?.activityStartTime);
          const formattedSubtitle = `${formattedDate} ${formattedTime} ${item?.city || ''} ${item?.address || ''}`;
          
          // 获取报名状态
          const applyStatus = getApplyStatus(item?.applyStartTime, item?.applyEndTime);
          
          // 获取活动状态（基于活动时间、报名开始/结束时间和报名状态）
          const activityStatus = getActivityStatus(item?.activityStartTime, item?.activityEndTime, item?.applyStartTime, item?.applyEndTime, item?.isRegistered);
          
          return {
            ...item,
            statusTagText: applyStatus?.statusTagText,
            statusClass: applyStatus?.statusClass,
            subtitle: formattedSubtitle,
            mainCoverImage: item?.mainCoverImage || '',
            condition: item?.applyCount && Number(item?.applyCount) > 0 ? item?.applyCount + '人已上车' : '',
            statusText: activityStatus?.statusText,
            status: activityStatus?.status,
          };
        });

        // 根据是否为加载更多来更新数据
        if (isLoadMore) {
          this.setData({
            [`tabData.${currentTab}.activityList`]: [...(tabData[currentTab].activityList || []), ...newData] as ActivityMpListVo[],
            [`tabData.${currentTab}.pageNum`]: tabData[currentTab].pageNum + 1,
            [`tabData.${currentTab}.hasMore`]: hasMore,
            [`tabData.${currentTab}.loading`]: false
          });
        } else {
          this.setData({
            [`tabData.${currentTab}.activityList`]: newData,
            [`tabData.${currentTab}.pageNum`]: 1,
            [`tabData.${currentTab}.hasMore`]: hasMore,
            [`tabData.${currentTab}.loading`]: false
          });
          console.log('newData', this.data);
          
        }
      }
    } catch (error) {
      const currentTab = this.data.config.tab as number;
      console.error('加载活动列表异常:', error);
      this.setData({ [`tabData.${currentTab}.loading`]: false });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.fetchActivityList().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 触底加载更多
  onReachBottom() {
    console.log('onReachBottom triggered');
    const currentTab = this.data.config.tab as number;
    const tabData = this.data.tabData[currentTab];
    
    // 如果已经没有更多数据或正在加载中，则不再加载
    if (!tabData.hasMore || tabData.loading) {
      console.log('No more data or loading in progress');
      return;
    }
    
    // 加载更多数据
    console.log('Loading more data for tab:', currentTab);
    this.fetchActivityList(true);
  },

  onTabChange(e:any) {
    const target = Number(e.currentTarget.dataset.index);
    if (this.data?.config?.tab !== target) {
      this.setData({ "config.tab": target });
      // 切换标签时重新加载数据
      this.fetchActivityList(false);
    }
  }

});


