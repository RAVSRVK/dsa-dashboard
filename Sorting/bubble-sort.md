# Bubble Sort

**Slug:** bubble sort
**Link:** https://leetcode.com/problems/bubble sort
**Difficulty:** Easy
**Date solved:** 2026-09-28
**Pattern:** Sort

## Problem in my own words

Bubble sort 

## Examples

### Example 1

- **Input:** 
- **Output:** 
- **Explanation:** 

## Key idea

compare the side by side elements and swap them to get the required output 


## Code

```javascript
function bubbleSort (arr) {
  for(let i = 0; i<arr.length -1; i++) {
    for(let j = 0; j<arr.length -i-1; j++) {
      let temp = 0
      if(arr[j] > arr[j+1]) {
        temp = arr[j]; 
        arr[j] = arr[j+1]; 
        arr[j+1] = temp
      }  
    }
  }
  return arr
}
```

## Dry run

### Example 1

**Input:** 

| Iteration | Variables state | Observation | Notes or changes |
| --- | --- | --- | --- |
| 1 |  |  |  |

## Complexity

- **Time:** O(n²)
- **Space:** 

## Remember

Use the J loop

## Revisit

- [ ] Redo without looking
