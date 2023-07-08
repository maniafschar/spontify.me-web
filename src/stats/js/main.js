import ApexCharts from 'apexcharts';
import { communication2 } from './communication2';
import { heatmap } from './heatmap';
import { ui2 } from './ui2';
import { charts } from './charts';
import { marketing } from './marketing';
import { global } from '../../js/global';
import { ui } from '../../js/ui';
import { user } from '../../js/user';

window.ApexCharts = ApexCharts;
window.ui2 = ui2;
window.communication2 = communication2;
window.heatmap = heatmap
window.charts = charts;
window.marketing = marketing;

ui2.init();