<template>
  <svg
    v-if="name === 'analytics'"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="iconClass"
  >
    <path d="M9.02 2.83992L3.63 7.03992C2.73 7.73992 2 9.22992 2 10.3599V17.7699C2 20.0899 3.89 21.9899 6.21 21.9899H17.79C20.11 21.9899 22 20.0899 22 17.7799V10.4999C22 9.28992 21.19 7.73992 20.2 7.04992L14.02 2.71992C12.62 1.73992 10.37 1.78992 9.02 2.83992Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16.5 11.5L12.3 15.7L10.7 13.3L7.5 16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14.5 11.5H16.5V13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

  <svg
    v-else-if="name === 'dashboard'"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="iconClass"
  >
    <path d="M2 2V19C2 20.66 3.34 22 5 22H22" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 17L9.59 11.64C10.35 10.76 11.7 10.7 12.52 11.53L13.47 12.48C14.29 13.3 15.64 13.25 16.4 12.37L21 7" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

  <svg
    v-else-if="name === 'chart'"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="iconClass"
  >
    <path d="M6.87988 18.1501V16.0801" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M12 18.15V14.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M17.1201 18.1499V11.9299" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M17.1199 5.8501L16.6599 6.3901C14.1099 9.3701 10.6899 11.4801 6.87988 12.4301" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M14.1899 5.8501H17.1199V8.7701" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

  <svg
    v-else-if="name === 'calendar'"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="iconClass"
  >
    <path d="M3 22H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5.59998 8.37988H4C3.45 8.37988 3 8.82988 3 9.37988V17.9999C3 18.5499 3.45 18.9999 4 18.9999H5.59998C6.14998 18.9999 6.59998 18.5499 6.59998 17.9999V9.37988C6.59998 8.82988 6.14998 8.37988 5.59998 8.37988Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12.7999 5.18994H11.2C10.65 5.18994 10.2 5.63994 10.2 6.18994V17.9999C10.2 18.5499 10.65 18.9999 11.2 18.9999H12.7999C13.3499 18.9999 13.7999 18.5499 13.7999 17.9999V6.18994C13.7999 5.63994 13.3499 5.18994 12.7999 5.18994Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19.9999 2H18.3999C17.8499 2 17.3999 2.45 17.3999 3V18C17.3999 18.55 17.8499 19 18.3999 19H19.9999C20.5499 19 20.9999 18.55 20.9999 18V3C20.9999 2.45 20.5499 2 19.9999 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

  <svg
    v-else-if="name === 'favorite'"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="iconClass"
  >
    <path d="M22 13V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.33008 14.49L9.71008 11.4C10.0501 10.96 10.6801 10.88 11.1201 11.22L12.9501 12.66C13.3901 13 14.0201 12.92 14.3601 12.49L16.6701 9.51001" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19.48 15.8199L19.76 16.3899C19.9 16.6699 20.25 16.9299 20.56 16.9899L20.94 17.0499C22.08 17.2399 22.35 18.0799 21.53 18.9099L21.18 19.2599C20.95 19.4999 20.82 19.9599 20.89 20.2799L20.94 20.4899C21.25 21.8699 20.52 22.3999 19.32 21.6799L19.06 21.5299C18.75 21.3499 18.25 21.3499 17.94 21.5299L17.68 21.6799C16.47 22.4099 15.74 21.8699 16.06 20.4899L16.1099 20.2799C16.1799 19.9599 16.05 19.4999 15.82 19.2599L15.47 18.9099C14.65 18.0799 14.92 17.2399 16.06 17.0499L16.44 16.9899C16.74 16.9399 17.1 16.6699 17.24 16.3899L17.52 15.8199C18.06 14.7299 18.94 14.7299 19.48 15.8199Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

  <svg
    v-else-if="name === 'key'"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="iconClass"
  >
    <path d="M19.79 14.9299C17.73 16.9799 14.78 17.6099 12.19 16.7999L7.48002 21.4999C7.14002 21.8499 6.47002 22.0599 5.99002 21.9899L3.81002 21.6899C3.09002 21.5899 2.42002 20.9099 2.31002 20.1899L2.01002 18.0099C1.94002 17.5299 2.17002 16.8599 2.50002 16.5199L7.20002 11.8199C6.40002 9.21995 7.02002 6.26995 9.08002 4.21995C12.03 1.26995 16.82 1.26995 19.78 4.21995C22.74 7.16995 22.74 11.9799 19.79 14.9299Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.89001 17.49L9.19001 19.79" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14.5 11C15.3284 11 16 10.3284 16 9.5C16 8.67157 15.3284 8 14.5 8C13.6716 8 13 8.67157 13 9.5C13 10.3284 13.6716 11 14.5 11Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <svg
    v-else-if="name === 'book'"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="iconClass"
  >
  <path d="M12 22.08C11.7 22.08 11.4 22.01 11.15 21.87C9.28 20.85 5.99 19.77 3.93 19.5L3.64 19.46C2.33 19.3 1.25 18.07 1.25 16.74V4.66001C1.25 3.87001 1.56 3.15001 2.13 2.63001C2.7 2.11001 3.44 1.86001 4.22 1.93001C6.42 2.10001 9.74 3.20001 11.62 4.38001L11.86 4.52001C11.93 4.56001 12.08 4.56001 12.14 4.53001L12.3 4.43001C14.18 3.25001 17.5 2.13001 19.71 1.94001C19.73 1.94001 19.81 1.94001 19.83 1.94001C20.56 1.87001 21.31 2.13001 21.87 2.65001C22.44 3.17001 22.75 3.89001 22.75 4.68001V16.75C22.75 18.09 21.67 19.31 20.35 19.47L20.02 19.51C17.96 19.78 14.66 20.87 12.83 21.88C12.59 22.02 12.3 22.08 12 22.08ZM3.98 3.42001C3.66 3.42001 3.37 3.53001 3.14 3.74001C2.89 3.97001 2.75 4.30001 2.75 4.66001V16.74C2.75 17.33 3.26 17.9 3.83 17.98L4.13 18.02C6.38 18.32 9.83 19.45 11.83 20.54C11.92 20.58 12.05 20.59 12.1 20.57C14.1 19.46 17.57 18.32 19.83 18.02L20.17 17.98C20.74 17.91 21.25 17.33 21.25 16.74V4.67001C21.25 4.30001 21.11 3.98001 20.86 3.74001C20.6 3.51001 20.27 3.40001 19.9 3.42001C19.88 3.42001 19.8 3.42001 19.78 3.42001C17.87 3.59001 14.79 4.62001 13.11 5.67001L12.95 5.78001C12.4 6.12001 11.62 6.12001 11.09 5.79001L10.85 5.65001C9.14 4.60001 6.06 3.58001 4.1 3.42001C4.06 3.42001 4.02 3.42001 3.98 3.42001Z" fill="#292D32"/>
  <path d="M12 21.24C11.59 21.24 11.25 20.9 11.25 20.49V5.48999C11.25 5.07999 11.59 4.73999 12 4.73999C12.41 4.73999 12.75 5.07999 12.75 5.48999V20.49C12.75 20.91 12.41 21.24 12 21.24Z" fill="#292D32"/>
  <path d="M7.75 9.23999H5.5C5.09 9.23999 4.75 8.89999 4.75 8.48999C4.75 8.07999 5.09 7.73999 5.5 7.73999H7.75C8.16 7.73999 8.5 8.07999 8.5 8.48999C8.5 8.89999 8.16 9.23999 7.75 9.23999Z" fill="#292D32"/>
  <path d="M8.5 12.24H5.5C5.09 12.24 4.75 11.9 4.75 11.49C4.75 11.08 5.09 10.74 5.5 10.74H8.5C8.91 10.74 9.25 11.08 9.25 11.49C9.25 11.9 8.91 12.24 8.5 12.24Z" fill="#292D32"/>
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  iconClass: {
    type: String,
    default: 'w-5 h-5'
  }
})
</script>