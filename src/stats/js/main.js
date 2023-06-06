import ApexCharts from 'apexcharts';
import { communication2 } from './communication2';
import { heatmap } from './heatmap';
import { ui2 } from './ui2';
import { charts } from './charts';
import { marketing } from './marketing';
import { global } from '../../js/global';
import { user } from '../../js/user';

window.ApexCharts = ApexCharts;
window.ui2 = ui2;
window.communication2 = communication2;
window.heatmap = heatmap
window.charts = charts;
window.marketing = marketing;

user.contact = window.user.contact;
user.clientId = window.user.clientId;
user.email = window.user.email;
user.password = window.user.password;
global.language = window.global.language;

ui2.init();