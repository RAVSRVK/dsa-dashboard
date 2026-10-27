# Reverse Linked List/

**Slug:** reverse-linked-list/
**Link:** https://leetcode.com/problems/reverse-linked-list/
**Difficulty:** Easy
**Date solved:** 2026-10-27
**Pattern:** linked list

## Problem in my own words

Given the head of a singly linked list, reverse the list, and return the reversed list.



## Examples

### Example 1

- **Input:** head = [1,2,3,4,5]

- **Output:** [5,4,3,2,1]
- **Explanation:** 

## Key idea

check how the variables assignment happens, what all are needed. 
Core idea - 
We need to store prev, current, temp(next node). 
reverse the links 

## Code

```javascript
var reverseList = function(head) {
    let prev = null
    let curr = head
    while(curr!=null) {
        let temp = curr.next
        curr.next = prev
        prev = curr
        curr = temp
    }
    return prev
};
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

- **Time:** 
- **Space:** 

## Remember



## Revisit

- [ ] Redo without looking
