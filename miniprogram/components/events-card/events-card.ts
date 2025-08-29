import * as navigateHelper from '../../utils/navigateHelper';

Component({
  properties: {
    title: String,
    subtitle: String,
    status: {
      type: String,
      value: 'default', // 可为：signing / registered / ended / interesting
    },
    statusText: String,
    statusTagText: String, // <-- 新增字段，如 "报名中"
    condition: String,
    images: String,
    avatars: {
      type: Array,
      value: [],
    },
    statusClass: String,
    eventId: String,
  },
  methods: {
    onPublicProfile() {
      return navigateHelper.goPublicProfile();
    },
    onEventsInfo() {
      const eventId = this.properties.eventId;
      return navigateHelper.goEventsInfo(eventId);
    },
  },
});
