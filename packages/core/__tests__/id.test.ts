import { describe, it, expect } from 'vitest'
import { getNodeTypeLabel, parseNodeId } from '../src/utils/id'
import type { SceneNodeType } from '../src/types/scene'

describe('getNodeTypeLabel', () => {
  it('should return Chinese label for rod', () => {
    expect(getNodeTypeLabel('rod')).toBe('杆')
  })

  it('should return Chinese label for shelf', () => {
    expect(getNodeTypeLabel('shelf')).toBe('层板')
  })

  it('should return Chinese label for crossClamp', () => {
    expect(getNodeTypeLabel('crossClamp')).toBe('十字夹')
  })

  it('should return Chinese label for fixedRing', () => {
    expect(getNodeTypeLabel('fixedRing')).toBe('固定环')
  })

  it('should return Chinese label for teeConnector', () => {
    expect(getNodeTypeLabel('teeConnector')).toBe('T型连接器')
  })

  it('should return Chinese label for ledStrip', () => {
    expect(getNodeTypeLabel('ledStrip')).toBe('LED灯带')
  })

  it('should return Chinese label for backPanel', () => {
    expect(getNodeTypeLabel('backPanel')).toBe('背板')
  })

  it('should return Chinese label for group', () => {
    expect(getNodeTypeLabel('group')).toBe('组')
  })
})

describe('parseNodeId', () => {
  it('should parse node id with sequence number', () => {
    const result = parseNodeId('rod-0')
    expect(result.type).toBe('rod')
    expect(result.typeLabel).toBe('杆')
    expect(result.sequence).toBe('0')
    expect(result.displayLabel).toBe('杆-0')
  })

  it('should parse node id with different sequence', () => {
    const result = parseNodeId('shelf-5')
    expect(result.type).toBe('shelf')
    expect(result.typeLabel).toBe('层板')
    expect(result.sequence).toBe('5')
    expect(result.displayLabel).toBe('层板-5')
  })

  it('should handle root node', () => {
    const result = parseNodeId('root')
    expect(result.type).toBe('group')
    expect(result.typeLabel).toBe('组')
    expect(result.sequence).toBe('')
    expect(result.displayLabel).toBe('组')
  })

  it('should handle node id without sequence', () => {
    const result = parseNodeId('crossClamp')
    expect(result.type).toBe('crossClamp')
    expect(result.typeLabel).toBe('十字夹')
    expect(result.sequence).toBe('')
    expect(result.displayLabel).toBe('十字夹')
  })

  it('should be stable - calling multiple times returns same result', () => {
    const result1 = parseNodeId('rod-0')
    const result2 = parseNodeId('rod-0')
    const result3 = parseNodeId('rod-0')

    expect(result1.displayLabel).toBe('杆-0')
    expect(result2.displayLabel).toBe('杆-0')
    expect(result3.displayLabel).toBe('杆-0')
  })
})
