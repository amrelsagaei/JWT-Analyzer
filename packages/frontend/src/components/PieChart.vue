<template>
  <div ref="chartContainer" class="pie-chart-container h-full w-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as d3 from 'd3';

// Define props
const props = defineProps<{
  data: Array<{ name: string; value: number }>
}>();

// Chart refs
const chartContainer = ref<HTMLElement | null>(null);
let chart: any = null;

// Update the color scale for even better contrast and visibility
const colorScale = d3.scaleOrdinal()
  .domain(['HS256', 'RS256', 'ES256', 'HS384', 'HS512', 'none', 'RS384', 'RS512', 'ES384', 'ES512', 'PS256'])
  .range([
    '#4285F4', // Blue
    '#EA4335', // Red
    '#FBBC05', // Yellow
    '#34A853', // Green
    '#8E44AD', // Purple
    '#555555', // Dark Gray
    '#00ACC1', // Teal
    '#E91E63', // Pink
    '#FF9800', // Orange
    '#3949AB', // Indigo
    '#9C27B0'  // Deep Purple
  ]);

// Create chart function with enhanced styling
const createChart = () => {
  if (!chartContainer.value || props.data.length === 0) return;
  
  // Clear previous chart if exists
  d3.select(chartContainer.value).selectAll('*').remove();
  
  // Set dimensions
  const containerWidth = chartContainer.value.clientWidth;
  const containerHeight = chartContainer.value.clientHeight;
  const margin = { top: 15, right: 15, bottom: 15, left: 15 };
  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;
  const radius = Math.min(width, height) * 0.5;
  
  // Create SVG with a responsive viewBox and gradient background
  const svg = d3.select(chartContainer.value)
    .append('svg')
    .attr('width', containerWidth)
    .attr('height', containerHeight)
    .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('g')
    .attr('transform', `translate(${containerWidth / 2}, ${containerHeight / 2})`);
  
  // Add defs for gradient and shadow effects
  const defs = svg.append('defs');
  
  // Add drop shadow filter for depth
  const dropShadow = defs.append('filter')
    .attr('id', 'drop-shadow')
    .attr('width', '130%')
    .attr('height', '130%');
    
  dropShadow.append('feGaussianBlur')
    .attr('in', 'SourceAlpha')
    .attr('stdDeviation', 2);
    
  dropShadow.append('feOffset')
    .attr('dx', 0)
    .attr('dy', 1);
    
  dropShadow.append('feComponentTransfer')
    .append('feFuncA')
    .attr('type', 'linear')
    .attr('slope', 0.3);
    
  dropShadow.append('feMerge')
    .selectAll('feMergeNode')
    .data(['SourceGraphic'])
    .enter()
    .append('feMergeNode')
    .attr('in', d => d);
  
  // Add radial gradient for elegant background
  const radialGradient = defs.append('radialGradient')
    .attr('id', 'radial-gradient')
    .attr('cx', '50%')
    .attr('cy', '50%')
    .attr('r', '50%');
    
  radialGradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', 'rgba(255, 255, 255, 0.15)');
    
  radialGradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', 'rgba(240, 240, 240, 0.05)');
  
  // Add a circular background
  svg.append('circle')
    .attr('r', radius * 0.85)
    .attr('fill', 'url(#radial-gradient)')
    .attr('class', 'chart-background');
  
  // Create pie chart with nice padding between segments
  const pie = d3.pie<any>()
    .value(d => d.value)
    .sort(null)
    .padAngle(0.02);
  
  const arcData = pie(props.data);
  
  // Improve the arc rendering for better visibility
  const arc = d3.arc()
    .innerRadius(radius * 0.5) // Create donut chart
    .outerRadius(radius * 0.8) // Larger outer radius for better visibility
    .cornerRadius(6); // More rounded corners for smoother appearance
  
  // Enhance the hover arc for better interaction
  const hoverArc = d3.arc()
    .innerRadius(radius * 0.48) 
    .outerRadius(radius * 0.85) // Even larger on hover
    .cornerRadius(8); // More rounded corners on hover
  
  // Create arcs with beautiful styling
  const arcs = svg.selectAll('.arc')
    .data(arcData)
    .enter()
    .append('g')
    .attr('class', 'arc');
  
  // Draw path elements with premium styling and transition
  arcs.append('path')
    .attr('d', arc as any)
    .attr('fill', (d: any) => colorScale(d.data.name))
    .attr('stroke', '#fff')
    .attr('stroke-width', '2px') // Thicker stroke
    .style('filter', 'url(#drop-shadow)')
    .style('opacity', 0)
    .transition()
    .duration(750)
    .ease(d3.easeElastic)
    .style('opacity', 1); // Full opacity
  
  // Enhance interactivity with smooth transitions
  arcs.selectAll('path')
    .on('mouseover', function(event, d: any) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', hoverArc as any)
        .style('opacity', 1)
        .style('stroke-width', '2px');
        
      // Show premium tooltip
      const percentage = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100;
      const tooltipContent = `
        <div class="chart-tooltip">
          <div class="tooltip-title">${d.data.name}</div>
          <div class="tooltip-count">${d.data.value} token${d.data.value !== 1 ? 's' : ''}</div>
          <div class="tooltip-percent">${percentage.toFixed(1)}%</div>
        </div>
      `;
      
      // Position tooltip with nice transition
      const tooltip = d3.select(chartContainer.value)
        .append('div')
        .attr('class', 'pie-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(30, 30, 30, 0.9)')
        .style('color', 'white')
        .style('padding', '10px 14px')
        .style('border-radius', '6px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '10')
        .style('box-shadow', '0 3px 8px rgba(0, 0, 0, 0.2)')
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY - 28}px`)
        .style('transform', 'scale(0.8)')
        .style('opacity', 0)
        .html(tooltipContent)
        .transition()
        .duration(200)
        .style('transform', 'scale(1)')
        .style('opacity', 1);
    })
    .on('mousemove', function(event) {
      d3.select(chartContainer.value).select('.pie-tooltip')
        .style('left', `${event.pageX + 15}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', arc as any)
        .style('opacity', 0.9)
        .style('stroke-width', '1.5px');
        
      // Remove tooltip with fade
      d3.select(chartContainer.value).select('.pie-tooltip')
        .transition()
        .duration(100)
        .style('transform', 'scale(0.8)')
        .style('opacity', 0)
        .remove();
    });
  
  // Display percentage labels elegantly
  arcs.append('text')
    .attr('transform', (d: any) => {
      // Only show text for segments big enough
      const percent = (d.endAngle - d.startAngle) / (2 * Math.PI);
      if (percent < 0.08) return '';
      return `translate(${arc.centroid(d)})`;
    })
    .attr('dy', '.35em')
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .attr('font-size', '11px')
    .attr('font-weight', 'bold')
    .text((d: any) => {
      const percent = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100;
      if (percent < 8) return '';
      return `${Math.round(percent)}%`;
    })
    .style('opacity', 0)
    .transition()
    .delay(750)
    .duration(400)
    .style('opacity', 1);
  
  // Add elegant center count display
  const totalTokens = props.data.reduce((sum, d) => sum + d.value, 0);
  
  const centerGroup = svg.append('g')
    .attr('class', 'center-label')
    .style('opacity', 0)
    .transition()
    .delay(800)
    .duration(400)
    .style('opacity', 1);
  
  centerGroup.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-0.2em')
    .attr('font-size', '20px')
    .attr('font-weight', 'bold')
    .text(totalTokens);
    
  centerGroup.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1.2em')
    .attr('font-size', '12px')
    .text(`token${totalTokens !== 1 ? 's' : ''}`);
};

// Add watcher for data changes to automatically update the chart
watch(() => props.data, () => {
  if (chartContainer.value) {
    // Re-render chart whenever data changes
    createChart();
  }
}, { deep: true, immediate: false });

// Handle window resize
const handleResize = () => {
  if (chart) {
    createChart();
  }
};

// Lifecycle hooks
onMounted(() => {
  createChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.pie-chart-container {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(252,252,252,0.1) 0%, rgba(240,240,245,0.05) 100%);
}

.chart-svg {
  filter: drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1));
}

.chart-tooltip {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2));
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 2px;
}

.tooltip-count {
  opacity: 0.9;
}

.tooltip-percent {
  opacity: 0.8;
  font-size: 11px;
}

.chart-background {
  opacity: 0.3;
}
</style>