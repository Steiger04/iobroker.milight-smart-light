exports.ids=[6],exports.modules={143:function(e,t,l){"use strict";l.r(t);var o=l(9),r={data:()=>({items:[{modeNumber:1,avatar:"M1",title:"Mode 1",subtitleRgbW:"Strobe white",subtitleFullColor:"Fire Mode",subtitleRgbW8:"Color flashes in red, green, blue, white, yellow, purple",divider:!1,inset:!1},{modeNumber:2,avatar:"M2",title:"Mode 2",subtitleRgbW:"RGBW fade in and fade out",subtitleFullColor:"Several colors gradual changing",subtitleRgbW8:"White color ramp up and flash",divider:!0,inset:!1},{modeNumber:3,avatar:"M3",title:"Mode 3",subtitleRgbW:"Color flashes in red, green, blue, white, yellow, purple",subtitleFullColor:"Different kelvin changing",subtitleRgbW8:"RGB fade in and fade out",divider:!0,inset:!1},{modeNumber:4,avatar:"M4",title:"Mode 4",subtitleRgbW:"Disco (different colors strobe and flash to change)",subtitleFullColor:"RGB with color temperature changing",subtitleRgbW8:"Seven colors flash",divider:!0,inset:!1},{modeNumber:5,avatar:"M5",title:"Mode 5",subtitleRgbW:"Red color ramp up and flash",subtitleFullColor:"Seven colors flash",subtitleRgbW8:"Random colors flash",divider:!0,inset:!1},{modeNumber:6,avatar:"M6",title:"Mode 6",subtitleRgbW:"Green color ramp up and flash",subtitleFullColor:"Random colors flash",subtitleRgbW8:"Red color ramp up and flash",divider:!0,inset:!1},{modeNumber:7,avatar:"M7",title:"Mode 7",subtitleRgbW:"Blue color ramp up and flash",subtitleFullColor:"Red gradual changing plus flash",subtitleRgbW8:"Green color ramp up and flash",divider:!0,inset:!1},{modeNumber:8,avatar:"M8",title:"Mode 8",subtitleRgbW:"Several colors fade into each other and then flash randomly",subtitleFullColor:"Green gradual changing plus flash",subtitleRgbW8:"Blue color ramp up and flash",divider:!0,inset:!1},{modeNumber:9,avatar:"M9",title:"Mode 9",subtitleRgbW:"Different colors fade into each other",subtitleFullColor:"Blue gradual changing plus flash",subtitleRgbW8:"White color ramp up and flash",divider:!0,inset:!1}]}),computed:{...Object(o.mapGetters)(["SHOW_BOTTOM_NAV","LOADED_ZONE"])},methods:{...Object(o.mapActions)(["UPDATE_DP_FROM_CLIENT","UPDATE_DP"]),setEffectMode(e){this.UPDATE_DP_FROM_CLIENT({value:e,dp:"effectMode",delay:500})}}},n=l(12),d=l(38),c=l.n(d),f=l(28),m=l(103),h=l(29),v=l(30),R=l(25),M=l(26),_=l(104),component=Object(n.a)(r,function(){var e=this,t=e.$createElement,l=e._self._c||t;return l("v-container",{attrs:{"fill-height":"",fluid:"","grid-list-xl":""}},[l("v-layout",{attrs:{row:""}},[l("v-flex",{attrs:{xs12:"",sm6:"","offset-sm3":""}},[l("v-list",{attrs:{"three-line":""}},[e._l(e.items,function(t,o){return[t.divider?l("v-divider",{key:o,attrs:{inset:t.inset}}):e._e(),e._v(" "),l("v-list-tile",{key:t.title,attrs:{to:"/modes/effect",ripple:"","active-class":""},nativeOn:{click:function(l){return e.setEffectMode(t.modeNumber)}}},[l("v-list-tile-content",["fullColor"===e.LOADED_ZONE.common.mslZoneType?l("v-list-tile-sub-title",{staticClass:"body-1 font-weight-regular",domProps:{innerHTML:e._s(t.subtitleFullColor)}}):e._e(),e._v(" "),"rgbw"===e.LOADED_ZONE.common.mslZoneType?l("v-list-tile-sub-title",{staticClass:"body-1 font-weight-regular",domProps:{innerHTML:e._s(t.subtitleRgbW)}}):e._e(),e._v(" "),"fullColor8Zone"===e.LOADED_ZONE.common.mslZoneType?l("v-list-tile-sub-title",{staticClass:"body-1 font-weight-regular",domProps:{innerHTML:e._s(t.subtitleRgbW8)}}):e._e()],1)],1)]})],2)],1)],1)],1)},[],!1,null,null,"75a52421");t.default=component.exports;c()(component,{VContainer:f.a,VDivider:m.a,VFlex:h.a,VLayout:v.a,VList:R.a,VListTile:M.a,VListTileContent:_.a,VListTileSubTitle:_.b})}};
//# sourceMappingURL=e20ca7d6d41ad7e5af69.js.map