export default function () {
  return {
     userColor: null
    ,userDarkMode: false
    ,userPhoto:null
    ,userID:null
    ,userCode:null
    ,userMail:null
    ,userName:null
    ,userLastName:null
    ,userProfileName:null
    ,userRowsPerPage:null
    ,userRowsToRender:null
    ,userTableLines:null
    ,userTableDense:null
    ,userDateFormat:null
    ,userTimeFormat:null
    ,userMoneyFormat:null
    ,userUsersFormat:null
    ,userCompanies:[]
    ,userCompany:null
    ,userLinkID:null
    ,menuData:[]
    ,currentPath: null
    ,currentPathModule: null
    ,currentReportData: null
    ,notificationInterval: 30000
    ,shouldHideMenu: false
    ,shouldHideTableButtons: false
    ,shouldWrapCellText: false
    ,selectedContact: 0
    ,unreadNotifications: []
    ,wsConnection: null
  }
}