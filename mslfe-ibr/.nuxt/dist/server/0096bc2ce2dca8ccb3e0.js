exports.ids=[2],exports.modules={131:function(e,t,n){e.exports=n.p+"img/fb0cb74.png"},132:function(e,t){e.exports=function(component,e){var t="function"==typeof component.exports?component.exports.extendOptions:component.options;for(var i in"function"==typeof component.exports&&(t.directives=component.exports.options.directives),t.directives=t.directives||{},e)t.directives[i]=t.directives[i]||e[i]}},136:function(e,t,n){"use strict";n.r(t);var r={name:"Intro",props:{newsize:0},data:()=>({}),computed:{resize(){return this.newsize>600?600:this.newsize}}},o=n(12),c=n(38),l=n.n(c),d=n(27),component=Object(o.a)(r,function(){var e=this.$createElement,t=this._self._c||e;return t("v-avatar",{attrs:{tile:"",size:this.resize+"px"}},[t("img",{attrs:{src:n(131)}})])},[],!1,null,null,"611996c3"),v=component.exports;l()(component,{VAvatar:d.a});var f={components:{mslIntro:v},data:()=>({windowSize:0}),mounted(){this.onResize()},methods:{onResize(){this.windowSize=window.innerWidth-64}}},z=n(28),h=n(29),x=n(30),m=n(132),w=n.n(m),y=n(13),R=Object(o.a)(f,function(){var e=this.$createElement,t=this._self._c||e;return t("v-container",{attrs:{"fill-height":"",fluid:""}},[t("v-layout",{directives:[{name:"resize",rawName:"v-resize",value:this.onResize,expression:"onResize"}],attrs:{row:""}},[t("v-flex",{attrs:{layout:"","align-center":"","justify-center":""}},[t("msl-intro",{attrs:{newsize:this.windowSize}})],1)],1)],1)},[],!1,null,null,"ae6477e6");t.default=R.exports;l()(R,{VContainer:z.a,VFlex:h.a,VLayout:x.a}),w()(R,{Resize:y.a})}};
//# sourceMappingURL=0096bc2ce2dca8ccb3e0.js.map