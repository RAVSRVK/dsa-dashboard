# Move Zeroes

**Slug:** move-zeroes
**Link:** https://leetcode.com/problems/move-zeroes
**Difficulty:** Easy
**Date solved:** 2026-09-22
**Pattern:** Two pointers

## Problem in my own words

Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements.

Note that you must do this in-place without making a copy of the array.



## Examples

### Example 1

- **Input:** nums = [0,1,0,3,12]

- **Output:** [1,3,12,0,0]
- **Explanation:** 

## Key idea

Initial idea 
variable p and i loop. If i !=p nums[p] = nums[i]
But this left the last 2 elements as it is but we need the last elements to be 0
Input
nums =
[0,1,0,3,12]
Output
[1,3,12,3,12]
Expected
[1,3,12,0,0]


So we got p - Run a loop from p till len(arr) and replace those with 0



## Code

```javascript
var moveZeroes = function(nums) {
    let p=0
    for(let i = 0; i< nums.length; i++) {
        if(nums[i]!=0) {
            nums[p] = nums[i]
            p++
        }
    }
    for(p; p<nums.length; p++) {
        nums[p] = 0
    }
};
```

## Dry run

### Example 1

**Input:** [0,1,0,3,12]

| Iteration | Variables state | Observation | Notes or changes |
| --- | --- | --- | --- |
| 1 |  |  |  |

## Complexity

- **Time:** O(n)
- **Space:** 

## Remember



## Revisit

- [ ] Redo without looking
