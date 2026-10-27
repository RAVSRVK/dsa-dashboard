# Linked List Cycle

**Slug:** linked-list-cycle
**Link:** https://leetcode.com/problems/linked-list-cycle
**Difficulty:** Easy
**Date solved:** 2026-10-27
**Pattern:** linked list

## Problem in my own words

Given head, the head of a linked list, determine if the linked list has a cycle in it.

There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer. Internally, pos is used to denote the index of the node that tail's next pointer is connected to. Note that pos is not passed as a parameter.

Return true if there is a cycle in the linked list. Otherwise, return false.



## Examples

### Example 1

- **Input:** 
- **Output:** 
- **Explanation:** 

### Example 2

- **Input:** 
- **Output:** 
- **Explanation:** 

## Key idea



## Code

```javascript
var hasCycle = function(head) {
    let p = new Set()
    let curr = head
    while(curr !==null) {
        if(p.has(curr)) {
            return true
        }
        p.add(curr)
        curr = curr.next

    }
    return false
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
