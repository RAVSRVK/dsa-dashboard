# Selection Sort

**Slug:** selection sort
**Link:** https://leetcode.com/problems/selection sort
**Difficulty:** Easy
**Date solved:** 2026-09-28
**Pattern:** Sort

## Problem in my own words

Selection sort q

## Examples

### Example 1

- **Input:** 
- **Output:** 
- **Explanation:** 

## Key idea

Identify the smallest and replace the beginning everytime 


## Code

```javascript
const arr = [1,44,3,5,2]

function selectionSort (arr) {
  for(let i = 0; i<arr.length -1; i++) {
    let minEle = i
    for(let j = i+1; j<arr.length; j++) {
      if(arr[minEle] > arr[j]) {
        minEle = j
      }
    }
    if(i!== minEle) {
      let temp = arr[minEle]
      arr[minEle] = arr[i]
      arr[i] = temp
    }
  }
  return arr
}
console.log(selectionSort(arr))
```

## Dry run

### Example 1

**Input:** 

| Iteration | Variables state | Observation | Notes or changes |
| --- | --- | --- | --- |
| 1 |  |  |  |

### Example 2

**Input:** 

| Iteration | Variables state | Observation | Notes or changes |
| --- | --- | --- | --- |
| 1 |  |  |  |

## Complexity

- **Time:** O(n²)
- **Space:** 

## Remember



## Revisit

- [ ] Redo without looking
