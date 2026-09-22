# Max Consecutive Ones

**Slug:** max-consecutive-ones
**Link:** https://leetcode.com/problems/max-consecutive-ones
**Difficulty:** Easy
**Date solved:** 2026-09-22
**Pattern:** Two pointers

## Problem in my own words

Given a binary array nums, return the maximum number of consecutive 1's in the array.



## Examples

### Example 1

- **Input:** nums = [1,1,0,1,1,1]

- **Output:** 3
- **Explanation:** The first two digits or the last three digits are consecutive 1s. The maximum number of consecutive 1s is 3.


## Key idea

2 vars temp and max_count
in loop 
- if 1 temp++
 - else update max_count to max(temp, max_count)

## Code

```javascript
var findMaxConsecutiveOnes = function(nums) {
    let max_ones = 0,  temp = 0
    for(let i=0; i< nums.length; i++) {
        if(nums[i]==1) {
            temp+=1
        } else {
            max_ones = Math.max(temp, max_ones)
            temp = 0
        }
    }
    return Math.max(temp, max_ones)
};

```

## Dry run

### Example 1

**Input:** 

| Iteration | Variables state | Observation | Notes or changes |
| --- | --- | --- | --- |
| 1 |  |  |  |

## Complexity

- **Time:** O(n)
- **Space:** 

## Remember



## Revisit

- [ ] Redo without looking
