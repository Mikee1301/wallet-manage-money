import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  guid: string;
  
  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isVerified: boolean; // Flag to track if email is verified

  @Column({ default: 'USER' })
  role: string;

  @Column({ nullable: true })
  otp?: string; // Store OTP code

  @Column({ type: 'timestamp', nullable: true })
  otpExpiresAt?: Date; // Expiration time for OTP

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
