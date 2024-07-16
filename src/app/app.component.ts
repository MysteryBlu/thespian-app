import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Subtitle {
  start: number;
  end: number;
  text: string;
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  currentSubtitles = '';

  private subtitles: Subtitle[] = [];
  private videoElement!: HTMLVideoElement;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.videoElement = document.getElementById('video') as HTMLVideoElement;
    this.loadSubtitles();
    this.videoElement.addEventListener('timeupdate', this.updateSubtitles.bind(this));
  }

  loadSubtitles(): void {
    this.http.get('assets/video_1/captions.srt', { responseType: 'text' }).subscribe(data => {
      console.log(data);
      this.subtitles = this.parseSRT(data);
      
    });
  }

  parseSRT(srt: string): Subtitle[] {
    const subtitles: Subtitle[] = [];
    const lines = srt.split('\r\n');
    let subtitle: Subtitle = { start: 0, end: 0, text: '' };

    for (const line of lines) {
      if (line.match(/^\d+$/)) {
        if (subtitle.text) {
          subtitles.push(subtitle);
          subtitle = { start: 0, end: 0, text: '' };
        }
      } else if (line.includes('-->')) {
        const times = line.split(' --> ');
        subtitle.start = this.timeToSeconds(times[0]);
        subtitle.end = this.timeToSeconds(times[1]);
      } else if (line.trim()) {
        subtitle.text += line;
      }
    }
    if (subtitle.text) {
      subtitles.push(subtitle);
    }

    console.log(subtitles);
    return subtitles;
  }

  timeToSeconds(time: string): number {
    const parts = time.split(':');
    const seconds = parts[2].split(',')[0];
    const milliseconds = parts[2].split(',')[1];
    return (
      parseInt(parts[0], 10) * 3600 +
      parseInt(parts[1], 10) * 60 +
      parseInt(seconds, 10) +
      parseInt(milliseconds, 10) / 1000
    );
  }

  updateSubtitles(): void {
    const currentTime = this.videoElement.currentTime;

    for (const subtitle of this.subtitles) {
      if (currentTime >= subtitle.start && currentTime <= subtitle.end) {
        this.currentSubtitles = subtitle.text;
        break;
      } else {
        this.currentSubtitles = '';
      }
    }
  }
}
